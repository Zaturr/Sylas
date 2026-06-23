package handler

import (
	"Alias_bdsa/Back/internal/ports"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type HTTPHandler struct {
	service ports.AliasService
}

// HTTPHandler estructura el controlador que expone los entry points del simulador.
func NewHTTPHandler(service ports.AliasService) *HTTPHandler {
	return &HTTPHandler{
		service: service,
	}
}

// CreateAliasRequest define el payload esperado del Front-End para registrar un alias.
type CreateAliasRequest struct {
	CustomerID string `json:"customer_id"`
	AliasValue string `json:"alias_value"`
}

// CreateAlias maneja la petición POST para registrar un nuevo alias único.
func (h *HTTPHandler) CreatedAlias(c *gin.Context) {
	var req CreateAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, 400, "JSON invalido")
		return
	}

	alias, err := h.service.CreateAlias(c.Request.Context(), req.CustomerID, req.AliasValue)
	if err != nil {
		respondError(c, 422, err.Error())
		return
	}

	c.JSON(201, alias)
}

// ResolveAlias maneja la petición GET para buscar y resolver las cuentas de un alias.
func (h *HTTPHandler) ResolveAlias(c *gin.Context) {
	aliasValue := c.Query("value") // Obtiene el query param ?value=...
	if aliasValue == "" {
		respondError(c, 400, "El alias es requerido")
		return
	}

	customer, accounts, err := h.service.ResolveAlias(c.Request.Context(), aliasValue)
	if err != nil {
		respondError(c, 404, err.Error())
		return
	}

	c.JSON(200, gin.H{
		"alias":    aliasValue,
		"customer": customer,
		"accounts": accounts,
	})
}

// ListAllAlias retorna alias paginados con sus detalles (?page=1&limit=20)
func (h *HTTPHandler) ListAllAlias(c *gin.Context) {
	page := parsePositiveInt(c.DefaultQuery("page", "1"), 1)
	limit := parsePositiveInt(c.DefaultQuery("limit", "20"), 20)
	if limit > 100 {
		limit = 100
	}

	search := strings.TrimSpace(c.Query("search"))
	result, err := h.service.GetAliasWithDetailsPaginated(c.Request.Context(), page, limit, search)
	if err != nil {
		respondError(c, 500, "Error interno del servidor")
		return
	}

	c.JSON(200, result)
}

func parsePositiveInt(value string, fallback int) int {
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}
