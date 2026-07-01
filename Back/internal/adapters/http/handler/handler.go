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

// ResolveAlias maneja GET /alias/resolve por documento (?document_type=V&document_number=12345678).
func (h *HTTPHandler) ResolveAlias(c *gin.Context) {
	documentType := strings.TrimSpace(c.Query("document_type"))
	documentNumber := strings.TrimSpace(c.Query("document_number"))
	if documentType == "" || documentNumber == "" {
		respondError(c, 400, "document_type y document_number son requeridos")
		return
	}

	customer, alias, accounts, err := h.service.ResolveAlias(
		c.Request.Context(),
		documentType,
		documentNumber,
	)
	if err != nil {
		respondError(c, 500, err.Error())
		return
	}
	if customer == nil {
		respondError(c, 404, "Titular no se encuentra en el sistema")
		return
	}
	if alias == nil {
		respondError(c, 404, "El titular no tiene alias registrado")
		return
	}

	c.JSON(200, gin.H{
		"alias":        alias.AliasValue,
		"alias_status": alias.Status,
		"customer":     customer,
		"accounts":     accounts,
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
