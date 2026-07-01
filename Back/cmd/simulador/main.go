package main

import (
	httphandler "Alias_bdsa/Back/internal/adapters/http/handler"
	simfadapter "Alias_bdsa/Back/internal/adapters/simf"
	"Alias_bdsa/Back/internal/adapters/storage/sqlite"
	"Alias_bdsa/Back/internal/application"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db, err := sqlite.InitDatabase("test.db")
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
		api.DELETE("/users/:customer_id", httpHandler.DeleteUserByCustomerID)

		// Randomizer
		api.POST("/randomizer", randomizerController.RunRandomizer)
	}

	simfadapter.RegisterRoutes(r, simfHandler)

	fmt.Println("Simulador escuchando en http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el simulador: %v", err)
	}
}
