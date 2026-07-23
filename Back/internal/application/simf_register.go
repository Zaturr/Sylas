package application

import (
	"Alias_bdca/Back/internal/domain"
	"context"
	"fmt"
	"strings"
)

// RegisterSimfUser registra titular, alias y vínculo IBP según reglas SIMF (IdModAdvc).
// AC06 si el alias está BLKD (aislado); ACRD si pertenece a otro titular;
// AG01 si el titular ya tiene un alias activo distinto.
func (s *AppService) RegisterSimfUser(
	ctx context.Context,
	customer *domain.Customer,
	accounts []domain.Account,
	alias *domain.Alias,
) error {
	existingCustomer, err := s.repo.GetCustomerByDocument(ctx, customer.DocumentType, customer.DocumentNumber)
	if err != nil {
		return err
	}

	aliasValue := ""
	if alias != nil {
		aliasValue = strings.TrimSpace(alias.AliasValue)
	}

	if aliasValue != "" {
		if s.isAliasBlacklisted(aliasValue) {
			return ErrSimfAliasBlacklisted
		}

		existingAliasByValue, err := s.repo.GetAliasByValue(ctx, aliasValue)
		if err != nil {
			return err
		}

		if existingAliasByValue != nil {
			if domain.IsAliasGloballyBlocked(existingAliasByValue.Status) {
				return ErrSimfAliasBlocked
			}
			if existingCustomer != nil && existingAliasByValue.CustomerID == existingCustomer.ID {
				return s.ensureSimfAccounts(ctx, existingCustomer.ID, accounts)
			}
			return ErrSimfAliasTaken
		}
	}

	if existingCustomer != nil {
		if aliasValue != "" && !domain.IsLegalEntityDocumentType(existingCustomer.DocumentType) {
			existingActiveAlias, err := s.repo.GetActiveAliasByCustomerID(ctx, existingCustomer.ID)
			if err != nil {
				return err
			}
			if existingActiveAlias != nil {
				return ErrSimfAliasLimitExceeded
			}
		}
		customer.ID = existingCustomer.ID
	}

	return s.repo.CreateFullUser(ctx, customer, accounts, alias)
}

func (s *AppService) ensureSimfAccounts(ctx context.Context, customerID string, accounts []domain.Account) error {
	existingAccounts, err := s.repo.GetAccountsByCustomerID(ctx, customerID)
	if err != nil {
		return err
	}

	linkedAccounts := make(map[string]struct{}, len(existingAccounts))
	for _, account := range existingAccounts {
		linkedAccounts[account.AccountNumber] = struct{}{}
	}

	for i := range accounts {
		account := accounts[i]
		account.CustomerID = customerID

		if _, exists := linkedAccounts[account.AccountNumber]; exists {
			continue
		}

		if err := s.repo.SaveAccount(ctx, &account); err != nil {
			errText := strings.ToLower(err.Error())
			if strings.Contains(errText, "foreign key constraint failed") {
				return fmt.Errorf("el banco con ID '%s' no existe en el sistema", account.BankID)
			}
			if strings.Contains(errText, "accounts.account_number") {
				return fmt.Errorf("el número de cuenta %s ya se encuentra registrado en el sistema", account.AccountNumber)
			}
			return err
		}
		linkedAccounts[account.AccountNumber] = struct{}{}
	}

	return nil
}
