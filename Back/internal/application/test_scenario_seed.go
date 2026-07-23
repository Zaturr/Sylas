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

	// 1) Recrear cada escenario (borra solo ese documento si existe, luego crea).
	//    Nunca hacemos DeleteAll primero: si algo falla a mitad, no dejamos la BD vacía.
	for _, scenario := range req.Scenarios {
		if err := validateTestScenario(scenario); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}

		documentType := resolveScenarioDocumentType(scenario)
		existing, err := s.repo.GetCustomerByDocument(ctx, documentType, scenario.DocumentNumber)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}
		recreating := false
		if existing != nil {
			if err := s.repo.DeleteCustomerByID(ctx, existing.ID); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
				continue
			}
			recreating = true
		}

		now := time.Now()
		customerID := uuid.New().String()
		customer := &domain.Customer{
			ID:             customerID,
			DocumentType:   documentType,
			DocumentNumber: scenario.DocumentNumber,
			FirstName:      scenario.FirstName,
			MiddleName:     scenario.MiddleName,
			LastName:       scenario.LastName,
			SecondLastName: scenario.SecondLastName,
			Email:          validations.BuildGmailFromCustomer(scenario.FirstName, scenario.MiddleName, scenario.LastName, scenario.SecondLastName, scenario.DocumentNumber),
			Phone:          validations.BuildVenezuelanPhoneFromDocument(scenario.DocumentNumber),
			CreatedAt:      now,
		}

		accounts := make([]domain.Account, 0, len(scenario.Accounts))
		for _, accountCfg := range scenario.Accounts {
			accType := strings.TrimSpace(accountCfg.Type)
			if accType == "" {
				accType = "corriente"
			}

			accounts = append(accounts, domain.Account{
				ID:            uuid.New().String(),
				BankID:        accountCfg.BankID,
				CustomerID:    customerID,
				AccountNumber: buildScenarioAccountNumber(accountCfg.BankID, scenario.DocumentNumber, accType),
				AccountType:   accType,
				Status:        testScenarioStatusToCore(accountCfg.Status),
				CreatedAt:     now,
			})
		}

		if isLegalEntityScenario(scenario) && len(scenario.Aliases) > 0 {
			if err := s.repo.CreateFullUser(ctx, customer, accounts, nil); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
				continue
			}

			if err := s.seedLegalEntityAliases(ctx, customerID, scenario); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
				continue
			}

			if recreating {
				result.Updated++
			} else {
				result.Created++
			}
			continue
		}

		aliasStatus := strings.TrimSpace(scenario.AliasStatus)
		if aliasStatus == "" {
			aliasStatus = domain.AliasStatusEnabled
		}

		var alias *domain.Alias
		if strings.TrimSpace(scenario.AliasValue) != "" {
			linkedAccountID := resolveNaturalLinkedAccountID(scenario, accounts)
			alias = &domain.Alias{
				ID:         uuid.New().String(),
				CustomerID: customerID,
				AccountID:  linkedAccountID,
				AliasValue: scenario.AliasValue,
				Status:     aliasStatus,
				CreatedAt:  now,
			}
		}

		if err := s.repo.CreateFullUser(ctx, customer, accounts, alias); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
			continue
		}

		if alias != nil {
			createdAlias, err := s.repo.GetAliasByCustomerID(ctx, customerID)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
				continue
			}
			if createdAlias != nil {
				persistedAccounts, err := s.repo.GetAccountsByCustomerID(ctx, customerID)
				if err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
					continue
				}
				if err := s.repo.SyncAliasBankLinksFromAccounts(ctx, createdAlias.ID, persistedAccounts); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("%s: %s", scenario.ID, err.Error()))
					continue
				}
			}
		}

		if recreating {
			result.Updated++
		} else {
			result.Created++
		}
	}

	// 2) Solo al final: borrar randomizador / docs que no son de los 30 escenarios.
	purged, err := s.purgeCustomersOutsideScenarios(ctx, req.Scenarios)
	if err != nil {
		return nil, fmt.Errorf("purge test scenarios: %w", err)
	}
	result.Purged = purged

	return result, nil
}

func (s *AppService) seedLegalEntityAliases(ctx context.Context, customerID string, scenario domain.TestScenario) error {
	for _, aliasCfg := range scenario.Aliases {
		accountID, err := resolveScenarioAccountID(ctx, s, scenario, aliasCfg.AccountIndex)
		if err != nil {
			return err
		}

		created, err := s.CreateAlias(ctx, customerID, aliasCfg.AliasValue, accountID)
		if err != nil {
			return err
		}

		aliasStatus := strings.ToUpper(strings.TrimSpace(aliasCfg.AliasStatus))
		if aliasStatus == domain.AliasStatusBlocked || aliasStatus == domain.AliasStatusDisabled {
			if err := s.repo.UpdateAliasStatus(ctx, created.ID, domain.AliasStatusBlocked); err != nil {
				return err
			}
		}
	}

	return nil
}

func resolveNaturalLinkedAccountID(scenario domain.TestScenario, accounts []domain.Account) string {
	index := 0
	if scenario.LinkedAccountIndex != nil {
		index = *scenario.LinkedAccountIndex
	}

	if index >= 0 && index < len(accounts) {
		candidate := accounts[index]
		if !domain.IsDollarAccount(candidate.AccountType) {
			return candidate.ID
		}
	}

	for _, account := range accounts {
		if !domain.IsDollarAccount(account.AccountType) {
			return account.ID
		}
	}

	if len(accounts) > 0 {
		return accounts[0].ID
	}

	return ""
}

func resolveScenarioDocumentType(scenario domain.TestScenario) string {
	documentType := strings.ToUpper(strings.TrimSpace(scenario.DocumentType))
	if documentType == "" {
		if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(scenario.ID)), "J-") {
			return "J"
		}
		return "V"
	}
	return documentType
}

func isLegalEntityScenario(scenario domain.TestScenario) bool {
	return domain.IsLegalEntityDocumentType(resolveScenarioDocumentType(scenario))
}

func resolveScenarioAccountID(
	ctx context.Context,
	service *AppService,
	scenario domain.TestScenario,
	accountIndex int,
) (string, error) {
	if accountIndex < 0 || accountIndex >= len(scenario.Accounts) {
		return "", fmt.Errorf("account_index %d fuera de rango", accountIndex)
	}

	accountCfg := scenario.Accounts[accountIndex]
	accType := strings.TrimSpace(accountCfg.Type)
	if accType == "" {
		accType = "corriente"
	}
	if domain.IsDollarAccount(accType) {
		return "", fmt.Errorf("las cuentas en divisa no admiten alias")
	}

	expectedNumber := buildScenarioAccountNumber(accountCfg.BankID, scenario.DocumentNumber, accType)
	customer, err := service.repo.GetCustomerByDocument(
		ctx,
		resolveScenarioDocumentType(scenario),
		scenario.DocumentNumber,
	)
	if err != nil {
		return "", err
	}
	if customer == nil {
		return "", fmt.Errorf("cliente no encontrado tras crear escenario")
	}

	accounts, err := service.repo.GetAccountsByCustomerID(ctx, customer.ID)
	if err != nil {
		return "", err
	}

	for _, account := range accounts {
		if account.AccountNumber == expectedNumber {
			return account.ID, nil
		}
	}

	return "", fmt.Errorf("no se encontró la cuenta del índice %d", accountIndex)
}

func validateTestScenario(scenario domain.TestScenario) error {
	if strings.TrimSpace(scenario.DocumentNumber) == "" {
		return fmt.Errorf("document_number es requerido")
	}

	scenarioID := strings.ToUpper(strings.TrimSpace(scenario.ID))
	isUnregistered := strings.HasPrefix(scenarioID, "UNRG-") || strings.HasPrefix(scenarioID, "J-UNRG-")
	isLegalEntity := isLegalEntityScenario(scenario)

	if isLegalEntity {
		if !isUnregistered && len(scenario.Aliases) == 0 {
			return fmt.Errorf("escenarios jurídicos requieren aliases")
		}
		if strings.TrimSpace(scenario.AliasValue) != "" {
			return fmt.Errorf("escenarios jurídicos deben usar aliases[], no alias_value")
		}
	} else {
		if !isUnregistered && strings.TrimSpace(scenario.AliasValue) == "" {
			return fmt.Errorf("alias_value es requerido")
		}
		if isUnregistered && strings.TrimSpace(scenario.AliasValue) != "" {
			return fmt.Errorf("escenarios UNRG no deben incluir alias_value")
		}
	}

	if isUnregistered && len(scenario.Aliases) > 0 {
		return fmt.Errorf("escenarios UNRG no deben incluir aliases")
	}

	if !isLegalEntity && !isUnregistered && scenario.LinkedAccountIndex != nil {
		index := *scenario.LinkedAccountIndex
		if index >= 0 && index < len(scenario.Accounts) && domain.IsDollarAccount(scenario.Accounts[index].Type) {
			return fmt.Errorf("linked_account_index no puede apuntar a una cuenta en divisa")
		}
	}

	if len(scenario.Accounts) == 0 {
		return fmt.Errorf("debe incluir al menos una cuenta")
	}

	linkedAccountIndexes := make(map[int]struct{}, len(scenario.Aliases))
	for _, aliasCfg := range scenario.Aliases {
		if _, exists := linkedAccountIndexes[aliasCfg.AccountIndex]; exists {
			return fmt.Errorf("account_index %d duplicado en aliases", aliasCfg.AccountIndex)
		}
		linkedAccountIndexes[aliasCfg.AccountIndex] = struct{}{}

		if aliasCfg.AccountIndex < 0 || aliasCfg.AccountIndex >= len(scenario.Accounts) {
			return fmt.Errorf("account_index %d fuera de rango", aliasCfg.AccountIndex)
		}
		if domain.IsDollarAccount(scenario.Accounts[aliasCfg.AccountIndex].Type) {
			return fmt.Errorf("account_index %d corresponde a cuenta en divisa", aliasCfg.AccountIndex)
		}
		if strings.TrimSpace(aliasCfg.AliasValue) == "" {
			return fmt.Errorf("alias_value es requerido en aliases")
		}
	}

	aliasStatus := strings.ToUpper(strings.TrimSpace(scenario.AliasStatus))
	if aliasStatus == "" {
		aliasStatus = domain.AliasStatusEnabled
	}

	if aliasStatus == domain.AliasStatusBlocked || aliasStatus == domain.AliasStatusDisabled {
		if err := validateBlockedScenarioAccounts(scenario.Accounts); err != nil {
			return err
		}
	}

	for _, aliasCfg := range scenario.Aliases {
		aliasCfgStatus := strings.ToUpper(strings.TrimSpace(aliasCfg.AliasStatus))
		if aliasCfgStatus != domain.AliasStatusBlocked && aliasCfgStatus != domain.AliasStatusDisabled {
			continue
		}
		account := scenario.Accounts[aliasCfg.AccountIndex]
		if !domain.IsAccountInactive(account.Status) {
			return fmt.Errorf("BLKD global requiere que el vínculo con cada banco asociado esté INAC")
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

func validateBlockedScenarioAccounts(accounts []domain.TestScenarioAccount) error {
	linkedByBank := make(map[string]struct{})
	for _, account := range accounts {
		if domain.IsDollarAccount(account.Type) {
			continue
		}
		if _, exists := linkedByBank[account.BankID]; exists {
			continue
		}
		linkedByBank[account.BankID] = struct{}{}
		if !domain.IsAccountInactive(account.Status) {
			return fmt.Errorf("BLKD global requiere que el vínculo con cada banco asociado esté INAC")
		}
	}
	if len(linkedByBank) == 0 {
		return fmt.Errorf("BLKD global requiere al menos un vínculo bancario")
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

func scenarioAccountTypeOffset(accountType string) int64 {
	switch strings.ToLower(strings.TrimSpace(accountType)) {
	case "ahorro":
		return 100000
	case "dolares":
		return 200000
	default:
		return 0
	}
}

func buildScenarioAccountNumber(bankID, documentNumber, accountType string) string {
	docNumber, err := strconv.ParseInt(documentNumber, 10, 64)
	if err != nil {
		docNumber = 1234567890
	}

	docNumber = (docNumber + scenarioAccountTypeOffset(accountType)) % 10000000000

	office := fmt.Sprintf("%04d", (docNumber%9000)+1000)
	account := fmt.Sprintf("%010d", docNumber)

	firstDigit := validations.GetDigitValue(bankID + office)
	secondDigit := validations.GetDigitValue(office + account)
	controlStr := fmt.Sprintf("%d%d", firstDigit, secondDigit)

	return bankID + office + controlStr + account
}

func (s *AppService) purgeCustomersOutsideScenarios(ctx context.Context, scenarios []domain.TestScenario) (int, error) {
	allowed := make(map[string]struct{}, len(scenarios))
	for _, scenario := range scenarios {
		docType := strings.ToUpper(strings.TrimSpace(resolveScenarioDocumentType(scenario)))
		key := docType + "|" + strings.TrimSpace(scenario.DocumentNumber)
		allowed[key] = struct{}{}
	}

	customers, err := s.repo.ListAllCustomers(ctx)
	if err != nil {
		return 0, err
	}

	purged := 0
	for _, customer := range customers {
		key := strings.ToUpper(strings.TrimSpace(customer.DocumentType)) + "|" + strings.TrimSpace(customer.DocumentNumber)
		if _, ok := allowed[key]; ok {
			continue
		}
		if err := s.repo.DeleteCustomerByID(ctx, customer.ID); err != nil {
			return purged, err
		}
		purged++
	}

	return purged, nil
}
