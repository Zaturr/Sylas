package corexml

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdca/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

func (h *Handler) UpdateAliasSimf(c *gin.Context) {
	var message simfdomain.UpdateEntradaDocument
	if err := readXMLBody(c, &message); err != nil {
		writeXML(c, http.StatusOK, response.BuildUpdateAliasFormatErrorMessage(simfdomain.UpdateAliasCommand{}))
		return
	}

	cmd, err := validate.ValidateUpdateAliasParams(
		c.Param("Alias"),
		c.Param("Agt"),
		message.IdModAdvc,
	)
	if err != nil {
		if validate.IsFormatError(err) {
			writeXML(c, http.StatusOK, response.BuildUpdateAliasFormatErrorMessage(partialUpdateAliasCommand(message.IdModAdvc)))
			return
		}
		writeInternalError(c)
		return
	}

	customer, err := h.core.UpdateSimfAliasAgentStatus(
		c.Request.Context(),
		cmd.Alias,
		cmd.AgentCode,
		cmd.Status,
	)
	if err != nil {
		reason := mapper.MapUpdateAliasBusinessReason(err)
		writeXML(c, http.StatusOK, response.BuildUpdateAliasRejectMessage(cmd, reason))
		return
	}

	writeXML(c, http.StatusOK, response.BuildUpdateAliasAcceptMessage(cmd, customer))
}
