package handler

import (
	"Alias_bdca/Back/internal/domain"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *HTTPHandler) SeedTestScenarios(c *gin.Context) {
	var req domain.TestScenarioSeedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "JSON invalido o parametros incorrectos")
		return
	}

	if len(req.Scenarios) == 0 {
		respondError(c, http.StatusBadRequest, "scenarios no puede estar vacio")
		return
	}

	if req.AccountType == "" {
		req.AccountType = "Cta. Corriente"
	}

	result, err := h.service.SeedTestScenarios(c.Request.Context(), req)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Fallo al cargar escenarios de prueba: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Carga de escenarios de prueba finalizada",
		"created":  result.Created,
		"updated":  result.Updated,
		"skipped":  result.Skipped,
		"purged":   result.Purged,
		"errors":   result.Errors,
		"total":    len(req.Scenarios),
	})
}
