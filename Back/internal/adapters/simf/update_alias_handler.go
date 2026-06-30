package simf

import (
	"net/http"

	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	"Alias_bdsa/Back/internal/adapters/simf/response"
	"Alias_bdsa/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

// UpdateAliasSimf PUT /simf/bdca/v1/aliases/update/{Alias}/{Agt}
func (h *SIMFHandler) UpdateAliasSimf(c *gin.Context) {
	var message simfdomain.UpdateAliasSimfMessage
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusOK, response.BuildUpdateAliasFormatErrorMessage(simfdomain.UpdateAliasCommand{}))
		return
	}

	cmd, err := validate.ValidateUpdateAliasParams(
		c.Param("Alias"),
		c.Param("Agt"),
		message.IdModAdvc,
	)
	if err != nil {
		if validate.IsFormatError(err) {
			c.JSON(http.StatusOK, response.BuildUpdateAliasFormatErrorMessage(partialUpdateAliasCommand(message.IdModAdvc)))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
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
		c.JSON(http.StatusOK, response.BuildUpdateAliasRejectMessage(cmd, reason))
		return
	}

	c.JSON(http.StatusOK, response.BuildUpdateAliasAcceptMessage(cmd, customer))
}

func partialUpdateAliasCommand(req simfdomain.UpdateAliasSimfRequest) simfdomain.UpdateAliasCommand {
	return simfdomain.UpdateAliasCommand{
		MsgID:      req.GrpHdr.MsgID,
		CreDtTm:    req.GrpHdr.CreDtTm,
		EndToEndID: req.Mod.EndToEndID,
		Alias:      req.Mod.Alias,
		AgentCode:  req.Mod.AgentCode,
		Status:     req.Mod.Status,
	}
}
