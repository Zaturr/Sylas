package simf

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	"Alias_bdca/Back/internal/domain"

	"github.com/gin-gonic/gin"
)

// ResolveAliasByDocument GET .../identities/{SchmeNm}/{Id}/Alias
func (h *SIMFHandler) ResolveAliasByDocument(c *gin.Context) {
	h.handleAliasResolve(c, false)
}

// ResolveAliasByDocumentWithAgent GET .../identities/{SchmeNm}/{Id}/alias/{Agt}
func (h *SIMFHandler) ResolveAliasByDocumentWithAgent(c *gin.Context) {
	h.handleAliasResolve(c, true)
}

func (h *SIMFHandler) handleAliasResolve(c *gin.Context, requireAgent bool) {
	agentCode := ""
	if requireAgent {
		agentCode = c.Param("Agt")
	}

	query, err := validate.ValidateAliasResolveParams(
		c.Param("SchmeNm"),
		c.Param("Id"),
		agentCode,
		requireAgent,
	)
	if err != nil {
		if validate.IsFormatError(err) {
			c.JSON(http.StatusOK, response.BuildFormatErrorMessage(query))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	documentType, documentNumber, err := mapper.QueryToCustomerDocument(query)
	if err != nil {
		c.JSON(http.StatusOK, response.BuildFormatErrorMessage(query))
		return
	}

	inquiry, err := h.core.ResolveAliasInquiry(c.Request.Context(), documentType, documentNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	if inquiry == nil || inquiry.Customer == nil || len(inquiry.Aliases) == 0 {
		c.JSON(http.StatusOK, response.BuildNotFoundMessage(query))
		return
	}

	bankLinksByAliasID := make(map[string][]domain.AliasBankLink, len(inquiry.Aliases))
	for _, alias := range inquiry.Aliases {
		links, linkErr := h.core.GetAliasBankLinksByAliasID(c.Request.Context(), alias.ID)
		if linkErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
			return
		}
		bankLinksByAliasID[alias.ID] = links
	}

	coreData := mapper.AliasResolveCoreData{
		Customer:           inquiry.Customer,
		Aliases:            inquiry.Aliases,
		Accounts:           inquiry.Accounts,
		BankLinksByAliasID: bankLinksByAliasID,
	}
	c.JSON(http.StatusOK, response.BuildAcceptMessage(query, coreData))
}
