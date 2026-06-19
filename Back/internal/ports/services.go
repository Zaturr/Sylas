package ports

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
)

type AliasService interface {
	RegisterCustomerWithAccount(ctx context.Context, customer *domain.Customer, account *domain.Account) error
	CreateAlias(ctx context.Context, customerID string, aliasValue string) (*domain.Alias, error)
	AddAccountToCustomer(ctx context.Context, documentNumber string, email string, aliasValue string, account *domain.Account) error
	ResolveAlias(ctx context.Context, aliasValue string) (*domain.Customer, []domain.Account, error)
	RemoveAlias(ctx context.Context, aliasID string) error
	GetAllAlias(ctx context.Context) ([]domain.Alias, error)
	GetAllAliasWithDetails(ctx context.Context) ([]domain.AliasDetail, error)
	CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error
}
