package mapper

import (
	"errors"
	"strings"

	"Alias_bdsa/Back/internal/application"
	"Alias_bdsa/Back/internal/domain"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// TitularFromCustomer arma Pty para respuestas IdVrfctnRpt de actualización.
func TitularFromCustomer(customer *domain.Customer) simfdomain.CreateUserSimfTitular {
	return simfdomain.CreateUserSimfTitular{
		Name:       CustomerFullNameUppercase(customer),
		DocumentID: DocumentIDFromCustomer(customer),
		SchemeName: SchemeNameFromDocumentType(customer.DocumentType),
	}
}

// SchemeNameFromDocumentType infiere SchmeNm SIMF desde el tipo de documento del core.
func SchemeNameFromDocumentType(documentType string) string {
	documentType = strings.ToUpper(strings.TrimSpace(documentType))
	if documentType == "" {
		return simfdomain.SchemeSCID
	}

	switch documentType[0] {
	case 'V', 'E':
		return simfdomain.SchemeSCID
	case 'J', 'G', 'C', 'R':
		return simfdomain.SchemeSRIF
	case 'P':
		return simfdomain.SchemeSPAS
	default:
		return simfdomain.SchemeSCID
	}
}

// MapUpdateAliasBusinessReason traduce errores de UpdateSimfAliasAgentStatus a Rsn SIMF.
func MapUpdateAliasBusinessReason(err error) string {
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
