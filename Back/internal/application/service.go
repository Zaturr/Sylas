package application

import (
	"Alias_bdsa/Back/internal/domain"
	"Alias_bdsa/Back/internal/ports"
	"context"
	"errors"
)

type AppService struct {
	repo ports.AliasRepository
}

func NewAppService(repo ports.AliasRepository) *AppService {
	return &AppService{
		repo: repo,
	}
}

func (s *AppService) RegisterCustomerWithAccount(ctx context.Context, customer *domain.Customer, account *domain.Account) error {
	err := s.repo.SaveCustomer(ctx, customer)
	if err != nil {
		return err
	}
	account.CustomerID = customer.ID
	return s.repo.SaveAccount(ctx, account)
}

func (s *AppService) CreateAlias(ctx context.Context, customerID string, aliasValue string) (*domain.Alias, error) {
	existingAlias, _ := s.repo.GetAliasByValue(ctx, aliasValue)
	if existingAlias != nil {
		return nil, errors.New("El alias ya existe")
	}
	newAlias := &domain.Alias{
		ID:         "ALIAS-" + customerID,
		CustomerID: customerID,
		AliasValue: aliasValue,
	}
	err := s.repo.SaveAlias(ctx, newAlias)
	if err != nil {
		return nil, err
	}
	return newAlias, nil
}

func (s *AppService) ResolveAlias(ctx context.Context, aliasValue string) (*domain.Customer, []domain.Account, error) {
	alias, err := s.repo.GetAliasByValue(ctx, aliasValue)
	if err != nil {
		return nil, nil, errors.New("Alias no se encuentra en el sistema")
	}
	customer, err := s.repo.GetCustomerByID(ctx, alias.CustomerID)
	if err != nil {
		return nil, nil, err
	}
	accounts, err := s.repo.GetAccountsByCustomerID(ctx, customer.ID)
	if err != nil {
		return nil, nil, err
	}
	return customer, accounts, nil
}

func (s *AppService) RemoveAlias(ctx context.Context, aliasID string) error {
	return s.repo.DeleteAlias(ctx, aliasID)
}

func (s *AppService) GetAllAlias(ctx context.Context) ([]domain.Alias, error) {
	return s.repo.ListAllAliases(ctx)
}
