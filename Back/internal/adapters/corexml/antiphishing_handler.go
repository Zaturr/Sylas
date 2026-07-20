package corexml

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	"Alias_bdca/Back/internal/domain"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AntiphishingSimf(c *gin.Context) {
	query, err := validate.ValidateAntiphishingSimfParams(
		c.Param("Alias"),
		c.Param("Agt_Destino"),
	)
	if err != nil {
		if validate.IsFormatError(err) {
			writeXML(c, http.StatusOK, response.BuildAntiphishingFormatErrorMessage(query))
			return
		}
		writeInternalError(c)
		return
	}

	customer, alias, accounts, err := h.core.ResolveAliasByValue(c.Request.Context(), query.Alias)
	if err != nil {
		writeInternalError(c)
		return
	}

	var aliases []domain.Alias
	var bankLinksByAliasID map[string][]domain.AliasBankLink
	if alias != nil {
		aliases = []domain.Alias{*alias}
		links, linkErr := h.core.GetAliasBankLinksByAliasID(c.Request.Context(), alias.ID)
		if linkErr != nil {
			writeInternalError(c)
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
	writeXML(c, http.StatusOK, response.BuildAntiphishingMessage(query, report))
}
