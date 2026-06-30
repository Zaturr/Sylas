package application

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
)

// UpdateSimfAliasAgentStatus actualiza el Sts del vínculo alias-agente (cuenta en la IBP).
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

	accounts, err := s.repo.GetAccountsByCustomerID(ctx, alias.CustomerID)
	if err != nil {
		return nil, err
	}

	var accountID string
	for _, account := range accounts {
		if account.BankID == bankID {
			accountID = account.ID
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
	case "BLKD":
		return "BLOCKED"
	default:
		return "INACTIVE"
	}
}
