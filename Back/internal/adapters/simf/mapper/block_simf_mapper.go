package mapper

import (
	"errors"
	"strings"

	"Alias_bdca/Back/internal/application"
	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// MapBlockSimfBusinessReason traduce errores de bloqueo SIMF a Rsn en IdVrfctnRpt.
func MapBlockSimfBusinessReason(err error) string {
	if err == nil {
		return simfdomain.ReasonNone
	}

	switch {
	case errors.Is(err, application.ErrSimfAliasNotFound):
		return simfdomain.ReasonNotFound
	case errors.Is(err, application.ErrSimfAgentNotLinked):
		return simfdomain.ReasonNotFound
	case errors.Is(err, application.ErrSimfUnauthorizedIBP):
		return simfdomain.ReasonUnauthorizedIBP
	case errors.Is(err, application.ErrSimfAliasBlocked):
		return simfdomain.ReasonAliasBlocked
	}

	errText := strings.ToLower(err.Error())
	if strings.Contains(errText, "banco") && strings.Contains(errText, "no existe") {
		return simfdomain.ReasonFormat
	}

	return simfdomain.ReasonFormat
}
