package ports

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
)

// AliasRepository define el contrato para la persistencia de datos del sistema de alias.
type AliasRepository interface {
	SaveCustomer(ctx context.Context, customer *domain.Customer) error
	GetCustomerByID(ctx context.Context, id string) (*domain.Customer, error)
	GetCustomerByVerificationData(ctx context.Context, documentNumber string, email string, aliasValue string) (*domain.Customer, error)

	SaveAccount(ctx context.Context, account *domain.Account) error
	GetAccountsByCustomerID(ctx context.Context, customerID string) ([]domain.Account, error)

	CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error
	SaveAlias(ctx context.Context, alias *domain.Alias) error
	GetAliasByValue(ctx context.Context, value string) (*domain.Alias, error)
	DeleteAlias(ctx context.Context, id string) error
	ListAllAliases(ctx context.Context) ([]domain.Alias, error)
	ListAllAliasesWithDetails(ctx context.Context) ([]domain.AliasDetail, error)
}
