package main

import (
	"context"
	httphandler "Alias_bdca/Back/internal/adapters/http/handler"
	"Alias_bdca/Back/internal/adapters/event_bus"
	"Alias_bdca/Back/internal/adapters/scribe"
	simfadapter "Alias_bdca/Back/internal/adapters/simf"
	"Alias_bdca/Back/internal/adapters/storage/sqlite"
	"Alias_bdca/Back/internal/application"
	appconfig "Alias_bdca/Back/internal/config"
	"Alias_bdca/Back/internal/restrictedwords"
	"Alias_bdca/Back/internal/ports"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	listenAddr, configPath, cfgErr := loadListenAddr()
	if cfgErr != nil {
		log.Printf("Aviso de configuración: %v", cfgErr)
	}
	if configPath != "" {
		fmt.Printf("Configuración cargada desde: %s\n", configPath)
	}

	obsCfg, obsErr := appconfig.LoadObservability(configPath)
	if obsErr != nil {
		log.Printf("Aviso de observabilidad: %v", obsErr)
	}

	var bus ports.EventBus
	if obsCfg.TraceEnabled {
		logger, err := scribe.NewScribeLogger(obsCfg)
		if err != nil {
			log.Fatalf("Error inicializando logger Scribe: %v", err)
		}
		bus = event_bus.New(obsCfg.TraceBufferSize)
		bus.Subscribe(scribe.NewScribeEventWriter(logger))
		fmt.Printf("Log de peticiones SIMF activo (archivo: %s, consola: %v)\n", obsCfg.ScribeFilePath, obsCfg.ScribeConsole)
	} else {
		bus = event_bus.NewDisabled()
		fmt.Println("Trazas desactivadas (TRACE_ENABLED=false)")
	}
	defer func() {
		_ = bus.Shutdown(context.Background())
	}()

	dbPath := "data/test.db"
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, os.ModePerm); err != nil {
		log.Fatalf("Error al crear el directorio de la base de datos: %v", err)
	}

	db, err := sqlite.InitDatabase(dbPath)
	if err != nil {
		log.Fatalf("Error al inicializar la base de datos: %v", err)
	}
	defer db.Close()
	fmt.Println("Base de datos SQLite inicializada.")

	sqliteRepo := sqlite.NewSQLiteRepo(db)

	restrictedWordsRel, restrictedCfgErr := appconfig.LoadRestrictedWordsFile(configPath)
	if restrictedCfgErr != nil {
		log.Printf("Aviso palabras restringidas: %v", restrictedCfgErr)
	}
	restrictedWordsPath := restrictedwords.ResolvePath(configPath, restrictedWordsRel)
	restrictedChecker, err := restrictedwords.Load(restrictedWordsPath)
	if err != nil {
		log.Fatalf("Error cargando palabras restringidas: %v", err)
	}
	fmt.Printf("Palabras restringidas cargadas: %d desde %s\n", restrictedChecker.Count(), restrictedWordsPath)

	appService := application.NewAppService(sqliteRepo, restrictedChecker)
	randomizerService := application.NewRandomizerService(sqliteRepo)
	httpHandler := httphandler.NewHTTPHandler(appService)
	randomizerController := httphandler.NewRandomizerController(randomizerService)
	simfHandler := simfadapter.NewSIMFHandler(appService)

	gin.SetMode(gin.ReleaseMode)
	// Inicializar Gin
	r := gin.Default()
	_ = r.SetTrustedProxies(nil)

	// Configurar CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))
	// Agrupar rutas
	api := r.Group("/api/v1")
	{
		api.POST("/alias", httpHandler.CreatedAlias)
		api.POST("/users", httpHandler.CreateUser)
		api.POST("/accounts", httpHandler.AddAccount)
		api.GET("/alias/resolve", httpHandler.ResolveAlias)
		api.GET("/alias/list", httpHandler.ListAllAlias)
		api.GET("/banks", httpHandler.ListBanks)
		api.DELETE("/alias/all", httpHandler.DeleteAllAliases)
		api.DELETE("/alias/id/:id", httpHandler.DeleteAliasByID)
		api.DELETE("/alias/:value", httpHandler.DeleteAliasByValue)
		api.PUT("/alias/:value/disable", httpHandler.DisableAlias)
		api.PUT("/alias/:value/account", httpHandler.UpdateAliasAccount)
		api.DELETE("/users/:customer_id", httpHandler.DeleteUserByCustomerID)

		// Randomizer
		api.POST("/randomizer", randomizerController.RunRandomizer)
		api.POST("/seed/test-scenarios", httpHandler.SeedTestScenarios)
	}

	simfadapter.RegisterRoutes(r, simfHandler, bus)

	registerConfigFileRoute(r, configPath)

	if err := registerWebUI(r); err != nil {
		log.Fatalf("Error al registrar la UI embebida: %v", err)
	}

	fmt.Printf("Simulador escuchando en todas las interfaces%s\n", listenAddr)
	fmt.Printf("  UI local:    http://localhost%s\n", listenAddr)
	if publicURL := loadPublicBaseURL(); publicURL != "" {
		fmt.Printf("  UI en red:   %s\n", publicURL)
		fmt.Printf("  API REST:    %s/api/v1\n", strings.TrimRight(publicURL, "/"))
		fmt.Printf("  API SIMF:    %s/simf/bdca/v1\n", strings.TrimRight(publicURL, "/"))
	} else {
		fmt.Println("  Tip: define PUBLIC_BASE_URL en config.json (ej. http://192.168.120.103:8080) para acceso desde otras PCs/Postman.")
	}
	if err := r.Run(listenAddr); err != nil {
		log.Fatalf("Error al iniciar el simulador: %v", err)
	}
}
