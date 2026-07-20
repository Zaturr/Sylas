package corexml

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdca/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

func (h *Handler) BlockSimf(c *gin.Context) {
	var message simfdomain.BlockEntradaDocument
	if err := readXMLBody(c, &message); err != nil {
		writeXML(c, http.StatusOK, response.BuildBlockSimfFormatErrorMessage(simfdomain.BlockSimfCommand{}))
		return
	}

	cmd, err := validate.ValidateBlockSimfParams(
		c.Param("Alias"),
		c.Param("Agt"),
		message.IdModAdvc,
	)
	if err != nil {
		if validate.IsFormatError(err) {
			writeXML(c, http.StatusOK, response.BuildBlockSimfFormatErrorMessage(partialBlockSimfCommand(message.IdModAdvc)))
			return
		}
		writeInternalError(c)
		return
	}

	customer, err := h.core.DisableAlias(c.Request.Context(), cmd.Alias)
	if err != nil {
		reason := mapper.MapBlockSimfBusinessReason(err)
		writeXML(c, http.StatusOK, response.BuildBlockSimfRejectMessage(cmd, reason))
		return
	}

	writeXML(c, http.StatusOK, response.BuildBlockSimfAcceptMessage(cmd, customer))
}
