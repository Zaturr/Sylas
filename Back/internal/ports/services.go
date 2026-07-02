package ports

import (
	"Alias_bdca/Back/internal/domain"
	"context"
)

type AliasService interface {
	RegisterCustomerWithAccount(ctx context.Context, customer *domain.Customer, account *domain.Account) error
	CreateAlias(ctx context.Context, customerID string, aliasValue string) (*domain.Alias, error)
	AddAccountToCustomer(ctx context.Context, documentNumber string, email string, aliasValue string, account *domain.Account) error
	ResolveAlias(ctx context.Context, documentType, documentNumber string) (*domain.Customer, *domain.Alias, []domain.Account, error)
	ResolveAliasByValue(ctx context.Context, aliasValue string) (*domain.Customer, *domain.Alias, []domain.Account, error)
	RemoveAlias(ctx context.Context, aliasID string) error
	RemoveAliasByValue(ctx context.Context, aliasValue string) error
	RemoveAliasByCustomerID(ctx context.Context, customerID string) error
	RemoveAllAliases(ctx context.Context) (int64, error)
	GetAllAlias(ctx context.Context) ([]domain.Alias, error)
	GetAliasWithDetailsPaginated(ctx context.Context, page, limit int, search string) (*domain.PaginatedAliasResponse, error)
	CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error

	DisableAlias(ctx context.Context, aliasValue string) (*domain.Customer, error)

	////////////////////////simf//////////////////////
	RegisterSimfUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error
	UpdateSimfAliasAgentStatus(ctx context.Context, aliasValue, bankID, simfStatus string) (*domain.Customer, error)
	GetBanks(ctx context.Context) ([]domain.Bank, error)
}
