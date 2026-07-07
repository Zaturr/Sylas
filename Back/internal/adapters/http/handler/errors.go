package handler

import (
	"errors"

	"Alias_bdca/Back/internal/application"

	"github.com/gin-gonic/gin"
)

func respondError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}

func mapSimfRegisterError(err error) (int, string) {
	switch {
	case errors.Is(err, application.ErrSimfAliasBlocked):
		return 422, "el alias está bloqueado (BLKD) y no puede reutilizarse"
	case errors.Is(err, application.ErrSimfAliasTaken):
		return 422, "el alias ya está registrado por otro titular"
	case errors.Is(err, application.ErrSimfAliasLimitExceeded):
		return 422, "el titular ya tiene un alias activo; debe bloquearlo (BLKD) antes de registrar otro"
	default:
		return 422, err.Error()
	}
}
