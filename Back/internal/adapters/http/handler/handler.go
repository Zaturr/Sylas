package handler

import (
	"Alias_bdsa/Back/internal/ports"

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
		c.JSON(400, gin.H{"error": "JSON invalido"})
		return
	}

	alias, err := h.service.CreateAlias(c.Request.Context(), req.CustomerID, req.AliasValue)
	if err != nil {
		c.JSON(422, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, alias)
}

// ResolveAlias maneja la petición GET para buscar y resolver las cuentas de un alias.
func (h *HTTPHandler) ResolveAlias(c *gin.Context) {
	aliasValue := c.Query("value") // Obtiene el query param ?value=...
	if aliasValue == "" {
		c.JSON(400, gin.H{"error": "El alias es requerido"})
		return
	}

	customer, accounts, err := h.service.ResolveAlias(c.Request.Context(), aliasValue)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"alias":    aliasValue,
		"customer": customer,
		"accounts": accounts,
	})
}

// ListAllAlias retorna todos los alias
func (h *HTTPHandler) ListAllAlias(c *gin.Context) {
	alias, err := h.service.GetAllAlias(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{"error": "Error interno del servidor"})
		return
	}

	c.JSON(200, alias)
}
