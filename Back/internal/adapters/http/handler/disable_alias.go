package handler

import (
	"Alias_bdca/Back/internal/application"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// DisableAlias deshabilita un alias a nivel global del core.
// PUT /api/v1/alias/:value/disable
func (h *HTTPHandler) DisableAlias(c *gin.Context) {
	aliasValue := strings.TrimSpace(c.Param("value"))
	if aliasValue == "" {
		respondError(c, http.StatusBadRequest, "El alias es requerido")
		return
	}

	customer, err := h.service.DisableAlias(c.Request.Context(), aliasValue)
	if err != nil {
		switch {
		case errors.Is(err, application.ErrSimfAliasNotFound):
			respondError(c, http.StatusNotFound, "alias no encontrado")
		case errors.Is(err, application.ErrSimfAliasBlocked):
			respondError(c, http.StatusConflict, "alias ya se encuentra deshabilitado")
		default:
			respondError(c, http.StatusInternalServerError, "No se pudo deshabilitar el alias")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"alias":    aliasValue,
		"status":   "DISABLED",
		"customer": customer,
	})
}
