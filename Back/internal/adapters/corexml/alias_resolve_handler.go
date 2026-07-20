package corexml

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	"Alias_bdca/Back/internal/domain"

	"github.com/gin-gonic/gin"
)

func (h *Handler) ResolveAliasByDocument(c *gin.Context) {
	h.handleAliasResolve(c, false)
}

func (h *Handler) ResolveAliasByDocumentWithAgent(c *gin.Context) {
	h.handleAliasResolve(c, true)
}

func (h *Handler) handleAliasResolve(c *gin.Context, requireAgent bool) {
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
			writeXML(c, http.StatusOK, response.BuildFormatErrorMessage(query))
			return
		}
		writeInternalError(c)
		return
	}

	documentType, documentNumber, err := mapper.QueryToCustomerDocument(query)
	if err != nil {
		writeXML(c, http.StatusOK, response.BuildFormatErrorMessage(query))
		return
	}

	inquiry, err := h.core.ResolveAliasInquiry(c.Request.Context(), documentType, documentNumber)
	if err != nil {
		writeInternalError(c)
		return
	}

	if inquiry == nil || inquiry.Customer == nil || len(inquiry.Aliases) == 0 {
		writeXML(c, http.StatusOK, response.BuildNotFoundMessage(query))
		return
	}

	bankLinksByAliasID := make(map[string][]domain.AliasBankLink, len(inquiry.Aliases))
	for _, alias := range inquiry.Aliases {
		links, linkErr := h.core.GetAliasBankLinksByAliasID(c.Request.Context(), alias.ID)
		if linkErr != nil {
			writeInternalError(c)
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
	writeXML(c, http.StatusOK, response.BuildAcceptMessage(query, coreData))
}
