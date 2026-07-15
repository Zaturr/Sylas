package simf

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	"Alias_bdca/Back/internal/domain"

	"github.com/gin-gonic/gin"
)

// AntiphishingSimf GET /simf/bdca/v1/aliases/{Alias}/resolutions/{Agt_Destino}
func (h *SIMFHandler) AntiphishingSimf(c *gin.Context) {
	query, err := validate.ValidateAntiphishingSimfParams(
		c.Param("Alias"),
		c.Param("Agt_Destino"),
	)
	if err != nil {
		if validate.IsFormatError(err) {
			c.JSON(http.StatusOK, response.BuildAntiphishingFormatErrorMessage(query))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	customer, alias, accounts, err := h.core.ResolveAliasByValue(c.Request.Context(), query.Alias)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	var aliases []domain.Alias
	var bankLinksByAliasID map[string][]domain.AliasBankLink
	if alias != nil {
		aliases = []domain.Alias{*alias}
		links, linkErr := h.core.GetAliasBankLinksByAliasID(c.Request.Context(), alias.ID)
		if linkErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
			return
		}
		bankLinksByAliasID = map[string][]domain.AliasBankLink{
			alias.ID: links,
		}
	}

	coreData := mapper.AliasResolveCoreData{
		Customer:           customer,
		Aliases:            aliases,
		Accounts:           accounts,
		BankLinksByAliasID: bankLinksByAliasID,
	}
	report := mapper.BuildAntiphishingReport(query, coreData)
	c.JSON(http.StatusOK, response.BuildAntiphishingMessage(query, report))
}
