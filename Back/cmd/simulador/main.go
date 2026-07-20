package main

import (
	corexmladapter "Alias_bdca/Back/internal/adapters/corexml"
	httphandler "Alias_bdca/Back/internal/adapters/http/handler"

	// simfadapter "Alias_bdca/Back/internal/adapters/simf" // JSON-JSON SIMF
	"Alias_bdca/Back/internal/adapters/storage/sqlite"
	"Alias_bdca/Back/internal/application"
	"fmt"
	"log"
	"os"
	"path/filepath"

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
	appService := application.NewAppService(sqliteRepo)
	randomizerService := application.NewRandomizerService(sqliteRepo)
	httpHandler := httphandler.NewHTTPHandler(appService)
	randomizerController := httphandler.NewRandomizerController(randomizerService)
	// simfHandler := simfadapter.NewSIMFHandler(appService) // legacy JSON SIMF — descomentar junto con RegisterRoutes

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

	// Core SIMF en :8080/simf/bdca/v1 — solo XML (servicio 3).
	// JSON al banco/front va a SIMF-Alias :9090/simf/bdca/v1 (servicio 2).
	// Adaptador JSON legacy comentado; no registrar simfadapter aquí.
	corexmlHandler := corexmladapter.NewHandler(appService)
	corexmladapter.RegisterRoutes(r, corexmlHandler)

	registerConfigFileRoute(r, configPath)

	if err := registerWebUI(r); err != nil {
		log.Fatalf("Error al registrar la UI embebida: %v", err)
	}

	fmt.Printf("Simulador escuchando en http://localhost%s\n", listenAddr)
	if err := r.Run(listenAddr); err != nil {
		log.Fatalf("Error al iniciar el simulador: %v", err)
	}
}
