package simf

import (
	"net/http"

	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	"Alias_bdsa/Back/internal/adapters/simf/response"
	"Alias_bdsa/Back/internal/adapters/simf/validate"

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

	customer, alias, accounts, err := h.core.ResolveAlias(
		c.Request.Context(),
		documentType,
		documentNumber,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	if customer == nil || alias == nil {
		c.JSON(http.StatusOK, response.BuildNotFoundMessage(query))
		return
	}

	coreData := mapper.AliasResolveCoreData{
		Customer: customer,
		Alias:    alias,
		Accounts: accounts,
	}
	c.JSON(http.StatusOK, response.BuildAcceptMessage(query, coreData))
}
