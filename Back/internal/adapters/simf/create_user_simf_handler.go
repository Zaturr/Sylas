package simf

import (
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/adapters/simf/response"
	"Alias_bdca/Back/internal/adapters/simf/validate"
	simfdomain "Alias_bdca/Back/internal/domain/simf"

	"github.com/gin-gonic/gin"
)

// CreateUserSimf POST /simf/bdca/v1/aliases (IdModAdvc).
func (h *SIMFHandler) CreateUserSimf(c *gin.Context) {
	var message simfdomain.CreateUserSimfMessage
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusOK, response.BuildCreateUserFormatErrorMessage(simfdomain.CreateUserSimfCommand{}))
		return
	}

	cmd, err := validate.ValidateCreateUserSimfRequest(message.IdModAdvc)
	if err != nil {
		if validate.IsFormatError(err) {
			c.JSON(http.StatusOK, response.BuildCreateUserFormatErrorMessage(partialCreateUserCommand(message.IdModAdvc)))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return
	}

	customer, accounts, alias, err := mapper.ToCoreCreateUserEntities(cmd)
	if err != nil {
		c.JSON(http.StatusOK, response.BuildCreateUserFormatErrorMessage(cmd))
		return
	}

	err = h.core.RegisterSimfUser(c.Request.Context(), customer, accounts, alias)
	if err != nil {
		reason := mapper.MapCreateUserBusinessReason(err)
		c.JSON(http.StatusOK, response.BuildCreateUserRejectMessage(cmd, reason))
		return
	}

	c.JSON(http.StatusOK, response.BuildCreateUserAcceptMessage(cmd))
}

func partialCreateUserCommand(req simfdomain.CreateUserSimfRequest) simfdomain.CreateUserSimfCommand {
	return simfdomain.CreateUserSimfCommand{
		MsgID:       req.GrpHdr.MsgID,
		CreDtTm:     req.GrpHdr.CreDtTm,
		AgentCode:   req.Mod.AgentCode,
		EndToEndID:  req.Mod.EndToEndID,
		Alias:       req.Mod.Alias,
		TitularName: req.Mod.Titular.Name,
		DocumentID:  req.Mod.Titular.DocumentID,
		SchemeName:  req.Mod.Titular.SchemeName,
	}
}
