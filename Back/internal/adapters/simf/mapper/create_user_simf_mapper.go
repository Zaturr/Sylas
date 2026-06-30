package mapper

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"Alias_bdsa/Back/internal/application"
	"Alias_bdsa/Back/internal/domain"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"

	"github.com/google/uuid"
)

const (
	coreAccountStatusInactive = "INACTIVE"
	coreAccountTypeDefault    = "CHECKING"
)

// ToCoreCreateUserEntities traduce el comando SIMF a entidades del core para RegisterSimfUser.
// La cuenta del agente queda INACTIVE (INAC en SIMF) hasta activación por IdVrfctnRpt.
func ToCoreCreateUserEntities(cmd simfdomain.CreateUserSimfCommand) (*domain.Customer, []domain.Account, *domain.Alias, error) {
	documentType, documentNumber, err := SplitDocumentIDIntoCustomerFields(cmd.SchemeName, cmd.DocumentID)
	if err != nil {
		return nil, nil, nil, err
	}

	firstName, lastName := SplitTitularName(cmd.TitularName)
	customerID := uuid.New().String()
	now := time.Now()

	customer := &domain.Customer{
		ID:             customerID,
		DocumentType:   documentType,
		DocumentNumber: documentNumber,
		FirstName:      firstName,
		LastName:       lastName,
		Email:          placeholderEmail(cmd.Alias),
		Phone:          placeholderPhone(documentType, documentNumber),
		CreatedAt:      now,
	}

	account := domain.Account{
		ID:            uuid.New().String(),
		BankID:        cmd.AgentCode,
		CustomerID:    customerID,
		AccountNumber: placeholderAccountNumber(cmd.AgentCode, cmd.EndToEndID),
		AccountType:   coreAccountTypeDefault,
		Status:        coreAccountStatusInactive,
		CreatedAt:     now,
	}

	alias := &domain.Alias{
		ID:         uuid.New().String(),
		CustomerID: customerID,
		AliasValue: cmd.Alias,
		CreatedAt:  now,
	}

	return customer, []domain.Account{account}, alias, nil
}

// SplitTitularName separa Nm SIMF (mayúsculas) en nombre y apellido del core.
func SplitTitularName(fullName string) (firstName, lastName string) {
	parts := strings.Fields(strings.TrimSpace(fullName))
	if len(parts) == 0 {
		return "", ""
	}
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], strings.Join(parts[1:], " ")
}

func placeholderEmail(alias string) string {
	return fmt.Sprintf("%s@simf.local", alias)
}

func placeholderPhone(documentType, documentNumber string) string {
	return fmt.Sprintf("SIMF%s%s", documentType, documentNumber)
}

func placeholderAccountNumber(agentCode, endToEndID string) string {
	suffix := endToEndID
	if len(suffix) > 12 {
		suffix = suffix[len(suffix)-12:]
	}
	return fmt.Sprintf("SIMF%s%s", agentCode, suffix)
}

// TitularFromCreateUserCommand arma Pty para respuestas IdVrfctnRpt.
func TitularFromCreateUserCommand(cmd simfdomain.CreateUserSimfCommand) simfdomain.CreateUserSimfTitular {
	return simfdomain.CreateUserSimfTitular{
		Name:       cmd.TitularName,
		DocumentID: cmd.DocumentID,
		SchemeName: cmd.SchemeName,
	}
}

// MapCreateUserBusinessReason traduce errores de RegisterSimfUser / core a Rsn SIMF.
func MapCreateUserBusinessReason(err error) string {
	if err == nil {
		return simfdomain.ReasonNone
	}

	switch {
	case errors.Is(err, application.ErrSimfAliasTaken):
		return simfdomain.ReasonAliasTaken
	case errors.Is(err, application.ErrSimfAliasLimitExceeded):
		return simfdomain.ReasonAliasLimit
	case errors.Is(err, application.ErrSimfUnauthorizedIBP):
		return simfdomain.ReasonUnauthorizedIBP
	case errors.Is(err, application.ErrSimfAliasBlocked):
		return simfdomain.ReasonAliasBlocked
	}

	errText := strings.ToLower(err.Error())
	switch {
	case strings.Contains(errText, "alias") && strings.Contains(errText, "en uso"):
		return simfdomain.ReasonAliasTaken
	case strings.Contains(errText, "ya tiene un alias"):
		return simfdomain.ReasonAliasLimit
	case strings.Contains(errText, "banco") && strings.Contains(errText, "no existe"):
		return simfdomain.ReasonFormat
	default:
		return simfdomain.ReasonFormat
	}
}
