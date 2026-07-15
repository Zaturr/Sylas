package application

import (
	"Alias_bdca/Back/internal/domain"
	"context"
)

// DisableAlias deshabilita un alias a nivel global del core (baja SIMF / block).
func (s *AppService) DisableAlias(ctx context.Context, aliasValue string) (*domain.Customer, error) {
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

	bankLinks, err := s.repo.GetAliasBankLinksByAliasID(ctx, alias.ID)
	if err != nil {
		return nil, err
	}

	accounts, err := s.repo.GetAccountsByCustomerID(ctx, alias.CustomerID)
	if err != nil {
		return nil, err
	}
	if !domain.AllAliasLinkedAccountsInactive(bankLinks, accounts) {
		return nil, ErrSimfAliasBlockRequiresInactiveAccounts
	}

	if err := s.repo.UpdateAliasStatus(ctx, alias.ID, domain.AliasStatusBlocked); err != nil {
		return nil, err
	}

	customer, err := s.repo.GetCustomerByID(ctx, alias.CustomerID)
	if err != nil {
		return nil, err
	}
	if customer == nil {
		return nil, ErrSimfAliasNotFound
	}

	return customer, nil
}
