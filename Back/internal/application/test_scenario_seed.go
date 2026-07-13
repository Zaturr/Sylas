package application

import (
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/validations"
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

func (s *AppService) SeedTestScenarios(ctx context.Context, req domain.TestScenarioSeedRequest) (*domain.TestScenarioSeedResult, error) {
	result := &domain.TestScenarioSeedResult{}

	for _, scenario := range req.Scenarios {
		if err := validateTestScenario(scenario); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}

		existing, err := s.repo.GetCustomerByDocument(ctx, "V", scenario.DocumentNumber)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}
		if existing != nil {
			result.Skipped++
			continue
		}

		now := time.Now()
		customerID := uuid.New().String()
		customer := &domain.Customer{
			ID:             customerID,
			DocumentType:   "V",
			DocumentNumber: scenario.DocumentNumber,
			FirstName:      scenario.FirstName,
			LastName:       scenario.LastName,
			Email:          validations.BuildGmailFromCustomer(scenario.FirstName, scenario.LastName, scenario.DocumentNumber),
			Phone:          validations.BuildVenezuelanPhoneFromDocument(scenario.DocumentNumber),
			CreatedAt:      now,
		}

		accounts := make([]domain.Account, 0, len(scenario.Accounts))
		for _, accountCfg := range scenario.Accounts {
			accounts = append(accounts, domain.Account{
				ID:            uuid.New().String(),
				BankID:        accountCfg.BankID,
				CustomerID:    customerID,
				AccountNumber: buildScenarioAccountNumber(accountCfg.BankID, scenario.DocumentNumber),
				AccountType:   req.AccountType,
				Status:        testScenarioStatusToCore(accountCfg.Status),
				CreatedAt:     now,
			})
		}

		aliasStatus := strings.TrimSpace(scenario.AliasStatus)
		if aliasStatus == "" {
			aliasStatus = domain.AliasStatusEnabled
		}

		var alias *domain.Alias
		if strings.TrimSpace(scenario.AliasValue) != "" {
			alias = &domain.Alias{
				ID:         uuid.New().String(),
				CustomerID: customerID,
				AliasValue: scenario.AliasValue,
				Status:     aliasStatus,
				CreatedAt:  now,
			}
		}

		if err := s.repo.CreateFullUser(ctx, customer, accounts, alias); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}

		result.Created++
	}

	return result, nil
}

func validateTestScenario(scenario domain.TestScenario) error {
	if strings.TrimSpace(scenario.DocumentNumber) == "" {
		return fmt.Errorf("document_number es requerido")
	}
	isUnregistered := strings.HasPrefix(strings.ToUpper(strings.TrimSpace(scenario.ID)), "UNRG-")
	if !isUnregistered && strings.TrimSpace(scenario.AliasValue) == "" {
		return fmt.Errorf("alias_value es requerido")
	}
	if isUnregistered && strings.TrimSpace(scenario.AliasValue) != "" {
		return fmt.Errorf("escenarios UNRG no deben incluir alias_value")
	}
	if len(scenario.Accounts) == 0 {
		return fmt.Errorf("debe incluir al menos una cuenta")
	}

	aliasStatus := strings.ToUpper(strings.TrimSpace(scenario.AliasStatus))
	if aliasStatus == "" {
		aliasStatus = domain.AliasStatusEnabled
	}

	if aliasStatus == domain.AliasStatusBlocked || aliasStatus == domain.AliasStatusDisabled {
		for _, account := range scenario.Accounts {
			status := strings.ToUpper(strings.TrimSpace(account.Status))
			if status != "INAC" && status != "INACTIVE" {
				return fmt.Errorf("BLKD global requiere que todas las cuentas esten INAC")
			}
		}
	}

	for _, account := range scenario.Accounts {
		status := strings.ToUpper(strings.TrimSpace(account.Status))
		switch status {
		case "ACTV", "ACTIVE", "INAC", "INACTIVE":
		default:
			return fmt.Errorf("status de cuenta invalido en banco %s: %s", account.BankID, account.Status)
		}
	}

	return nil
}

func testScenarioStatusToCore(status string) string {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case "ACTV", "ACTIVE":
		return "ACTIVE"
	case "INAC", "INACTIVE":
		return "INACTIVE"
	default:
		return "INACTIVE"
	}
}

func buildScenarioAccountNumber(bankID, documentNumber string) string {
	docNumber, err := strconv.ParseInt(documentNumber, 10, 64)
	if err != nil {
		docNumber = 1234567890
	}
	
	// Para construir una cuenta válida necesitamos 20 dígitos:
	// bankCode (4) + office (4) + control (2) + account (10)
	office := fmt.Sprintf("%04d", (docNumber%9000)+1000) // 4 digitos
	account := fmt.Sprintf("%010d", docNumber)          // 10 digitos

	firstDigit := validations.GetDigitValue(bankID + office)
	secondDigit := validations.GetDigitValue(office + account)
	controlStr := fmt.Sprintf("%d%d", firstDigit, secondDigit)

	return bankID + office + controlStr + account
}
