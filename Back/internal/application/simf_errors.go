package application

import "errors"

// Errores de negocio SIMF para mapear a Rsn en IdVrfctnRpt.
var (
	ErrSimfAliasTaken          = errors.New("simf_alias_taken")
	ErrSimfAliasLimitExceeded  = errors.New("simf_alias_limit_exceeded")
	ErrSimfUnauthorizedIBP     = errors.New("simf_unauthorized_ibp")
	ErrSimfAliasBlocked        = errors.New("simf_alias_blocked")
	ErrSimfAliasNotFound       = errors.New("simf_alias_not_found")
	ErrSimfAgentNotLinked      = errors.New("simf_agent_not_linked")
)
