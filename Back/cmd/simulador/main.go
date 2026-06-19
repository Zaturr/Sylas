package main

import (
	"Alias_bdsa/Back/internal/adapters/http/handler"
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
	httpHandler := handler.NewHTTPHandler(appService)
	randomizerController := handler.NewRandomizerController(db)

	// Inicializar Gin
	r := gin.Default()

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

		// Randomizer
		api.POST("/randomizer", randomizerController.RunRandomizer)
	}

	fmt.Println("Simulador escuchando en http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Error al iniciar el simulador: %v", err)
	}
}
