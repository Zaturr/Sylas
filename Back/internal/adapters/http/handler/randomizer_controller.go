package handler

import (
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/ports"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RandomizerController struct {
	service ports.RandomizerService
}

func NewRandomizerController(service ports.RandomizerService) *RandomizerController {
	return &RandomizerController{service: service}
}

type RandomizerRequest struct {
	TotalCustomers         int               `json:"total_customers"`
	MaxAccountsPerCustomer int               `json:"max_accounts_per_customer"`
	Banks                  []domain.BankSeed `json:"banks"`
}

func (ctrl *RandomizerController) RunRandomizer(c *gin.Context) {
	var req RandomizerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "JSON invalido o parametros incorrectos")
		return
	}

	config := domain.RandomizerConfig{
		TotalCustomers:         req.TotalCustomers,
		MaxAccountsPerCustomer: req.MaxAccountsPerCustomer,
		Banks:                  req.Banks,
	}

	err := ctrl.service.Run(c.Request.Context(), config)
	if err != nil {
		if err.Error() == "parametros invalidos" {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}
		respondError(c, http.StatusInternalServerError, "Fallo al generar datos aleatorios: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Generacion aleatoria finalizada con exito",
		"customers_created": req.TotalCustomers,
	})
}
