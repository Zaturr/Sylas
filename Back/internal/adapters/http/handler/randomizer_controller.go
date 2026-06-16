package handler

import (
	"Alias_bdsa/Back/internal/adapters/simulation"
	"database/sql"

	"github.com/gin-gonic/gin"
)

type RandomizerController struct {
	db *sql.DB
}

func NewRandomizerController(db *sql.DB) *RandomizerController {
	return &RandomizerController{
		db: db,
	}
}

type RandomizerRequest struct {
	TotalCustomers         int                     `json:"total_customers"`
	MaxAccountsPerCustomer int                     `json:"max_accounts_per_customer"`
	Banks                  []simulation.BankParams `json:"banks"`
}

func (ctrl *RandomizerController) RunRandomizer(c *gin.Context) {
	var req RandomizerRequest

	// ShouldBindJSON parsea el body automáticamente
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "JSON invalido o parámetros incorrectos"})
		return
	}

	if req.TotalCustomers <= 0 || req.MaxAccountsPerCustomer <= 0 || len(req.Banks) == 0 {
		c.JSON(400, gin.H{"error": "Parametros invalidos"})
		return
	}

	config := simulation.RandomizerConfig{
		TotalCustomers:         req.TotalCustomers,
		MaxAccountsPerCustomer: req.MaxAccountsPerCustomer,
		Banks:                  req.Banks,
	}

	err := simulation.RunDataRandomizer(c.Request.Context(), ctrl.db, config)
	if err != nil {
		c.JSON(500, gin.H{"error": "Fallo al generar datos aleatorios: " + err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"message":           "Generación aleatoria masiva con Faker finalizada con éxito",
		"customers_created": req.TotalCustomers,
	})
}
