package application

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
	"fmt"
	"strings"
)

// RegisterSimfUser registra titular, alias y vínculo IBP según reglas SIMF (IdModAdvc).
// ACRD solo si el alias pertenece a otro documento; AG01 si el documento ya tiene alias distinto.
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

	existingAliasByValue, err := s.repo.GetAliasByValue(ctx, alias.AliasValue)
	if err != nil {
		return err
	}

	if existingAliasByValue != nil {
		if existingCustomer != nil && existingAliasByValue.CustomerID == existingCustomer.ID {
			return s.ensureSimfAccounts(ctx, existingCustomer.ID, accounts)
		}
		return ErrSimfAliasTaken
	}

	if existingCustomer != nil {
		existingAliasByCustomer, err := s.repo.GetAliasByCustomerID(ctx, existingCustomer.ID)
		if err != nil {
			return err
		}
		if existingAliasByCustomer != nil {
			return ErrSimfAliasLimitExceeded
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

	linkedBanks := make(map[string]struct{}, len(existingAccounts))
	for _, account := range existingAccounts {
		linkedBanks[account.BankID] = struct{}{}
	}

	for i := range accounts {
		account := accounts[i]
		account.CustomerID = customerID

		if _, exists := linkedBanks[account.BankID]; exists {
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
		linkedBanks[account.BankID] = struct{}{}
	}

	return nil
}
