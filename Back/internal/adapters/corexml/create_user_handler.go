package corexml

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdca/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreateUserSimf(c *gin.Context) {
	var message simfdomain.CreateEntradaDocument
	if err := readXMLBody(c, &message); err != nil {
		writeXML(c, http.StatusOK, response.BuildCreateUserFormatErrorMessage(simfdomain.CreateUserSimfCommand{}))
		return
	}

	cmd, err := validate.ValidateCreateUserSimfRequest(message.IdModAdvc)
	if err != nil {
		if validate.IsFormatError(err) {
			writeXML(c, http.StatusOK, response.BuildCreateUserFormatErrorMessage(partialCreateUserCommand(message.IdModAdvc)))
			return
		}
		writeInternalError(c)
		return
	}

	customer, accounts, alias, err := mapper.ToCoreCreateUserEntities(cmd)
	if err != nil {
		writeXML(c, http.StatusOK, response.BuildCreateUserFormatErrorMessage(cmd))
		return
	}

	err = h.core.RegisterSimfUser(c.Request.Context(), customer, accounts, alias)
	if err != nil {
		reason := mapper.MapCreateUserBusinessReason(err)
		writeXML(c, http.StatusOK, response.BuildCreateUserRejectMessage(cmd, reason))
		return
	}

	writeXML(c, http.StatusOK, response.BuildCreateUserAcceptMessage(cmd))
}
