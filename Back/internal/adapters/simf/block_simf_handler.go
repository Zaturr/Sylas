package simf

import (
	"net/http"

	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	"Alias_bdsa/Back/internal/adapters/simf/response"
	"Alias_bdsa/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

// BlockSimf PUT/POST /simf/bdca/v1/aliases/delete/{Alias}/{Agt} — baja global (Sts BLKD).
func (h *SIMFHandler) BlockSimf(c *gin.Context) {
	var message simfdomain.BlockSimfMessage
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusOK, response.BuildBlockSimfFormatErrorMessage(simfdomain.BlockSimfCommand{}))
		return
	}

	cmd, err := validate.ValidateBlockSimfParams(
		c.Param("Alias"),
		c.Param("Agt"),
		message.IdModAdvc,
	)
	if err != nil {
		if validate.IsFormatError(err) {
			c.JSON(http.StatusOK, response.BuildBlockSimfFormatErrorMessage(partialBlockSimfCommand(message.IdModAdvc)))
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
		reason := mapper.MapBlockSimfBusinessReason(err)
		c.JSON(http.StatusOK, response.BuildBlockSimfRejectMessage(cmd, reason))
		return
	}

	c.JSON(http.StatusOK, response.BuildBlockSimfAcceptMessage(cmd, customer))
}

func partialBlockSimfCommand(req simfdomain.BlockSimfRequest) simfdomain.BlockSimfCommand {
	return simfdomain.BlockSimfCommand{
		MsgID:      req.GrpHdr.MsgID,
		CreDtTm:    req.GrpHdr.CreDtTm,
		EndToEndID: req.Mod.EndToEndID,
		Alias:      req.Mod.Alias,
		AgentCode:  req.Mod.AgentCode,
		Status:     req.Mod.Status,
	}
}
