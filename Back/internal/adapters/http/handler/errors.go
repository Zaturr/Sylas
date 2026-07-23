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
	case errors.Is(err, application.ErrSimfAliasBlacklisted):
		return 422, "el alias contiene una palabra restringida (RR04)"
	case errors.Is(err, application.ErrSimfAccountAlreadyHasAlias):
		return 422, "la cuenta ya tiene un alias asociado"
	case errors.Is(err, application.ErrSimfAccountNotEligible):
		return 422, "las cuentas en dólares no pueden vincularse a un alias"
	case errors.Is(err, application.ErrSimfAccountNotFound):
		return 422, "la cuenta no pertenece al titular"
	case errors.Is(err, application.ErrSimfAccountRequired):
		return 422, "account_id es requerido para titulares jurídicos"
	default:
		return 422, err.Error()
	}
}
