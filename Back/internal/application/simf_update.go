package application

import (
	"Alias_bdca/Back/internal/domain"
	"context"
	"time"

	"github.com/google/uuid"
)

// UpdateSimfAliasAgentStatus actualiza el Sts del vínculo alias-agente (cuenta en la IBP).
// Solo permite ACTV, INAC y PNDL. BLKD se gestiona únicamente vía DisableAlias (baja global).
func (s *AppService) UpdateSimfAliasAgentStatus(
	ctx context.Context,
	aliasValue, bankID, simfStatus string,
) (*domain.Customer, error) {
	alias, err := s.repo.GetAliasByValue(ctx, aliasValue)
	if err != nil {
		return nil, err
	}
	if alias == nil {
		return nil, ErrSimfAliasNotFound
	}
	if domain.IsAliasGloballyBlocked(alias.Status) {
		return nil, ErrSimfAliasBlocked
	}

	accounts, err := s.repo.GetAccountsByCustomerID(ctx, alias.CustomerID)
	if err != nil {
		return nil, err
	}

	bankLinks, err := s.repo.GetAliasBankLinksByAliasID(ctx, alias.ID)
	if err != nil {
		return nil, err
	}

	var accountID string
	for _, link := range bankLinks {
		if link.BankID == bankID {
			accountID = link.AccountID
			break
		}
	}

	// Fallback: cuenta primaria del alias si es del mismo banco.
	if accountID == "" && alias.AccountID != "" {
		for _, account := range accounts {
			if account.ID == alias.AccountID && account.BankID == bankID {
				accountID = account.ID
				break
			}
		}
	}

	// Fallback: el titular tiene cuenta no-dólares en ese Agt.
	// El panel muestra bancos desde accounts; el update antes solo miraba alias_bank_links.
	if accountID == "" {
		for _, account := range accounts {
			if account.BankID != bankID || domain.IsDollarAccount(account.AccountType) {
				continue
			}
			accountID = account.ID
			_ = s.repo.UpsertAliasBankLink(ctx, &domain.AliasBankLink{
				ID:        uuid.New().String(),
				AliasID:   alias.ID,
				BankID:    bankID,
				AccountID: account.ID,
				CreatedAt: time.Now(),
			})
			break
		}
	}

	if accountID == "" {
		return nil, ErrSimfAgentNotLinked
	}

	coreStatus := simfStatusToCore(simfStatus)
	if err := s.repo.UpdateAccountStatus(ctx, accountID, coreStatus); err != nil {
		return nil, err
	}

	customer, err := s.repo.GetCustomerByID(ctx, alias.CustomerID)
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func simfStatusToCore(simfStatus string) string {
	switch simfStatus {
	case "ACTV":
		return "ACTIVE"
	case "INAC":
		return "INACTIVE"
	case "PNDL":
		return "PNDL"
	default:
		return "INACTIVE"
	}
}
