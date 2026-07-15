package ports

import (
	"Alias_bdca/Back/internal/domain"
	"context"
)

// AliasRepository define el contrato para la persistencia de datos del sistema de alias.
type AliasRepository interface {
	SaveCustomer(ctx context.Context, customer *domain.Customer) error
	GetCustomerByID(ctx context.Context, id string) (*domain.Customer, error)
	GetCustomerByDocument(ctx context.Context, documentType, documentNumber string) (*domain.Customer, error)
	GetCustomerByDocumentNumber(ctx context.Context, documentNumber string) (*domain.Customer, error)
	GetCustomerByVerificationData(ctx context.Context, documentNumber string, email string, aliasValue string) (*domain.Customer, error)

	SaveAccount(ctx context.Context, account *domain.Account) error
	GetAccountsByCustomerID(ctx context.Context, customerID string) ([]domain.Account, error)
	UpdateAccountStatus(ctx context.Context, accountID, status string) error

	CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error
	SaveAlias(ctx context.Context, alias *domain.Alias) error
	UpdateAliasStatus(ctx context.Context, aliasID, status string) error
	UpdateAliasAccount(ctx context.Context, aliasValue, accountID string) error
	UpsertAliasBankLink(ctx context.Context, link *domain.AliasBankLink) error
	SyncAliasBankLinksFromAccounts(ctx context.Context, aliasID string, accounts []domain.Account) error
	GetAliasBankLinksByAliasID(ctx context.Context, aliasID string) ([]domain.AliasBankLink, error)
	GetAliasBankLinksByAliasValue(ctx context.Context, aliasValue string) ([]domain.AliasBankLink, error)
	GetAliasByValue(ctx context.Context, value string) (*domain.Alias, error)
	GetAliasByCustomerID(ctx context.Context, customerID string) (*domain.Alias, error)
	ListAliasesByCustomerID(ctx context.Context, customerID string) ([]domain.Alias, error)
	GetAliasByAccountID(ctx context.Context, accountID string) (*domain.Alias, error)
	GetActiveAliasByCustomerID(ctx context.Context, customerID string) (*domain.Alias, error)
	GetAliasByID(ctx context.Context, id string) (*domain.Alias, error)
	DeleteAlias(ctx context.Context, id string) error
	DeleteCustomerByID(ctx context.Context, customerID string) error
	DeleteAllCustomers(ctx context.Context) (int64, error)
	ListAllAliases(ctx context.Context) ([]domain.Alias, error)
	ListAllAliasesWithDetailsPaginated(ctx context.Context, page, limit int, search string) (*domain.PaginatedAliasResponse, error)
	ListBanks(ctx context.Context) ([]domain.Bank, error)
}
