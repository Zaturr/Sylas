package ports

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
)

type AliasService interface {
	RegisterCustomerWithAccount(ctx context.Context, customer *domain.Customer, account *domain.Account) error
	CreateAlias(ctx context.Context, customerID string, aliasValue string) (*domain.Alias, error)
	ResolveAlias(ctx context.Context, aliasValue string) (*domain.Customer, []domain.Account, error)
	RemoveAlias(ctx context.Context, aliasID string) error
	GetAllAlias(ctx context.Context) ([]domain.Alias, error)
}
