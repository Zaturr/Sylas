package handler

import (
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/ports"
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
	AccountID  string `json:"account_id"`
}

// CreateAlias maneja la petición POST para registrar un nuevo alias único.
func (h *HTTPHandler) CreatedAlias(c *gin.Context) {
	var req CreateAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, 400, "JSON invalido")
		return
	}

	alias, err := h.service.CreateAlias(c.Request.Context(), req.CustomerID, req.AliasValue, req.AccountID)
	if err != nil {
		status, message := mapSimfRegisterError(err)
		respondError(c, status, message)
		return
	}

	c.JSON(201, alias)
}

type UpdateAliasAccountRequest struct {
	AccountID string `json:"account_id"`
}

// UpdateAliasAccount maneja PUT /alias/:value/account
func (h *HTTPHandler) UpdateAliasAccount(c *gin.Context) {
	aliasValue := strings.TrimSpace(c.Param("value"))
	if aliasValue == "" {
		respondError(c, 400, "el valor del alias es requerido")
		return
	}

	var req UpdateAliasAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, 400, "JSON invalido")
		return
	}

	err := h.service.UpdateAliasAccount(c.Request.Context(), aliasValue, req.AccountID)
	if err != nil {
		respondError(c, 500, "Error actualizando cuenta del alias")
		return
	}

	c.JSON(200, gin.H{"message": "Cuenta vinculada actualizada con éxito"})
}

// ResolveAlias maneja GET /alias/resolve por documento (?document_type=V&document_number=12345678).
func (h *HTTPHandler) ResolveAlias(c *gin.Context) {
	documentType := strings.TrimSpace(c.Query("document_type"))
	documentNumber := strings.TrimSpace(c.Query("document_number"))
	if documentType == "" || documentNumber == "" {
		respondError(c, 400, "document_type y document_number son requeridos")
		return
	}

	inquiry, err := h.service.ResolveAliasInquiry(
		c.Request.Context(),
		documentType,
		documentNumber,
	)
	if err != nil {
		respondError(c, 500, err.Error())
		return
	}
	if inquiry == nil || inquiry.Customer == nil {
		respondError(c, 404, "Titular no se encuentra en el sistema")
		return
	}

	response := gin.H{
		"customer":          inquiry.Customer,
		"accounts":          inquiry.Accounts,
		"document_profile":  profileLabel(inquiry.IsLegalEntity),
		"is_legal_entity":   inquiry.IsLegalEntity,
	}

	if len(inquiry.Aliases) == 0 {
		response["alias"] = nil
		response["alias_status"] = domain.AliasStatusUnregistered
		response["account_id"] = nil
		response["aliases"] = []interface{}{}
		c.JSON(200, response)
		return
	}

	primaryAlias := inquiry.Aliases[len(inquiry.Aliases)-1]
	response["alias"] = primaryAlias.AliasValue
	response["alias_status"] = primaryAlias.Status
	response["account_id"] = primaryAlias.AccountID

	aliasEntries := make([]gin.H, 0, len(inquiry.Aliases))
	for _, alias := range inquiry.Aliases {
		bankLinks, linkErr := h.service.GetAliasBankLinkDetails(c.Request.Context(), alias.ID, inquiry.Accounts)
		if linkErr != nil {
			respondError(c, 500, linkErr.Error())
			return
		}
		aliasEntries = append(aliasEntries, gin.H{
			"alias_value":  alias.AliasValue,
			"alias_status": alias.Status,
			"account_id":   alias.AccountID,
			"bank_links":   bankLinks,
		})
	}
	response["aliases"] = aliasEntries

	bankLinks, err := h.service.GetAliasBankLinkDetails(c.Request.Context(), primaryAlias.ID, inquiry.Accounts)
	if err != nil {
		respondError(c, 500, err.Error())
		return
	}
	response["bank_links"] = bankLinks

	c.JSON(200, response)
}

func profileLabel(isLegalEntity bool) string {
	if isLegalEntity {
		return "LEGAL_ENTITY"
	}
	return "NATURAL"
}

// ListAllAlias retorna alias paginados con sus detalles (?page=1&limit=20)
func (h *HTTPHandler) ListAllAlias(c *gin.Context) {
	page := parsePositiveInt(c.DefaultQuery("page", "1"), 1)
	limit := parsePositiveInt(c.DefaultQuery("limit", "20"), 20)
	if limit > 100 {
		limit = 100
	}

	search := strings.TrimSpace(c.Query("search"))
	scheme := strings.ToUpper(strings.TrimSpace(c.Query("scheme")))
	switch scheme {
	case "", "SCID", "SRIF", "SPAS":
		// ok
	default:
		respondError(c, 400, "scheme debe ser SCID, SRIF, SPAS o vacío")
		return
	}

	result, err := h.service.GetAliasWithDetailsPaginated(c.Request.Context(), page, limit, search, scheme)
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
