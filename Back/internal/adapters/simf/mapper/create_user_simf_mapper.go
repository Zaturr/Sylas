package mapper

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"Alias_bdca/Back/internal/application"
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/validations"
	simfdomain "Alias_bdca/Back/internal/domain/simf"

	"github.com/google/uuid"
)

const (
	coreAccountStatusActive   = "ACTIVE"
	coreAccountTypeDefault    = "corriente"
)

func ToCoreCreateUserEntities(cmd simfdomain.CreateUserSimfCommand) (*domain.Customer, []domain.Account, *domain.Alias, error) {
	documentType, documentNumber, err := SplitDocumentIDIntoCustomerFields(cmd.SchemeName, cmd.DocumentID)
	if err != nil {
		return nil, nil, nil, err
	}

	firstName, middleName, lastName, secondLastName := SplitTitularName(cmd.TitularName)
	customerID := uuid.New().String()
	now := time.Now()

	customer := &domain.Customer{
		ID:             customerID,
		DocumentType:   documentType,
		DocumentNumber: documentNumber,
		FirstName:      firstName,
		MiddleName:     middleName,
		LastName:       lastName,
		SecondLastName: secondLastName,
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
		Status:        coreAccountStatusActive,
		CreatedAt:     now,
	}

	alias := &domain.Alias{
		ID:         uuid.New().String(),
		CustomerID: customerID,
		AliasValue: cmd.Alias,
		AccountID:  account.ID,
		CreatedAt:  now,
	}

	return customer, []domain.Account{account}, alias, nil
}

func SplitTitularName(fullName string) (firstName, middleName, lastName, secondLastName string) {
	parts := strings.Fields(strings.TrimSpace(fullName))
	if len(parts) == 0 {
		return "", "", "", ""
	}
	if len(parts) == 1 {
		return parts[0], "", "", ""
	}
	if len(parts) == 2 {
		return parts[0], "", parts[1], ""
	}
	if len(parts) == 3 {
		// Si hay 3 palabras, asumimos:
		// 1er nombre, (sin 2do nombre), 1er apellido, 2do apellido.
		return parts[0], "", parts[1], parts[2]
	}
	
	// Si hay 4 o más palabras, asumimos:
	// 1er nombre, 2do nombre, 1er apellido, y el resto es 2do apellido.
	return parts[0], parts[1], parts[2], strings.Join(parts[3:], " ")
}

func placeholderEmail(alias string) string {
	return validations.BuildGmailFromAlias(alias)
}

func placeholderPhone(_ string, documentNumber string) string {
	return validations.BuildVenezuelanPhoneFromDocument(documentNumber)
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
	case strings.Contains(errText, "cuenta") && strings.Contains(errText, "alias asociado"):
		return simfdomain.ReasonAliasLimit
	case strings.Contains(errText, "ya tiene un alias"):
		return simfdomain.ReasonAliasLimit
	case strings.Contains(errText, "banco") && strings.Contains(errText, "no existe"):
		return simfdomain.ReasonFormat
	case strings.Contains(errText, "foreign key constraint failed"):
		return simfdomain.ReasonFormat
	default:
		return simfdomain.ReasonFormat
	}
}
