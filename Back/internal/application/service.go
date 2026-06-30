package application

import (
	"Alias_bdsa/Back/internal/domain"
	"Alias_bdsa/Back/internal/ports"
	"context"
	"errors"
	"strings"
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

// ResolveAlias busca titular, alias y cuentas por tipo y número de documento (cédula).
func (s *AppService) ResolveAlias(ctx context.Context, documentType, documentNumber string) (*domain.Customer, *domain.Alias, []domain.Account, error) {
	customer, err := s.repo.GetCustomerByDocument(ctx, documentType, documentNumber)
	if err != nil {
		return nil, nil, nil, err
	}
	if customer == nil {
		return nil, nil, nil, nil
	}

	alias, err := s.repo.GetAliasByCustomerID(ctx, customer.ID)
	if err != nil {
		return nil, nil, nil, err
	}
	if alias == nil {
		return customer, nil, nil, nil
	}

	accounts, err := s.repo.GetAccountsByCustomerID(ctx, customer.ID)
	if err != nil {
		return nil, nil, nil, err
	}

	return customer, alias, accounts, nil
}

func (s *AppService) AddAccountToCustomer(ctx context.Context, documentNumber string, email string, aliasValue string, account *domain.Account) error {
	// 1. Verificar que el cliente existe y que los datos coinciden
	customer, err := s.repo.GetCustomerByVerificationData(ctx, documentNumber, email, aliasValue)
	if err != nil {
		return err
	}
	if customer == nil {
		return errors.New("los datos de verificación (cédula, correo o alias) no coinciden con ningún usuario registrado")
	}

	// 2. Asociar la cuenta al ID del cliente encontrado
	account.CustomerID = customer.ID

	// 3. Guardar la cuenta
	err = s.repo.SaveAccount(ctx, account)
	if err != nil {
		// Traducir el error si la cuenta ya existe o el banco no existe
		errStr := err.Error()
		if strings.Contains(errStr, "accounts.account_number") {
			return errors.New("el número de cuenta ya se encuentra registrado en el sistema")
		}
		if strings.Contains(errStr, "FOREIGN KEY constraint failed") {
			return errors.New("el banco especificado no existe")
		}
		if strings.Contains(errStr, "UNIQUE constraint failed: accounts.customer_id, accounts.bank_id") {
			return errors.New("el usuario ya tiene una cuenta registrada en este banco")
		}
		return err
	}

	return nil
}

func (s *AppService) RemoveAlias(ctx context.Context, aliasID string) error {
	return s.repo.DeleteAlias(ctx, aliasID)
}

func (s *AppService) RemoveAliasByValue(ctx context.Context, aliasValue string) error {
	alias, err := s.repo.GetAliasByValue(ctx, aliasValue)
	if err != nil {
		return err
	}
	if alias == nil {
		return errors.New("alias no encontrado")
	}
	return s.repo.DeleteCustomerByID(ctx, alias.CustomerID)
}

func (s *AppService) RemoveAliasByCustomerID(ctx context.Context, customerID string) error {
	customer, err := s.repo.GetCustomerByID(ctx, customerID)
	if err != nil {
		return err
	}
	if customer == nil {
		return errors.New("cliente no encontrado")
	}
	return s.repo.DeleteCustomerByID(ctx, customerID)
}

func (s *AppService) RemoveAllAliases(ctx context.Context) (int64, error) {
	return s.repo.DeleteAllCustomers(ctx)
}

func (s *AppService) GetAllAlias(ctx context.Context) ([]domain.Alias, error) {
	return s.repo.ListAllAliases(ctx)
}

func (s *AppService) GetAliasWithDetailsPaginated(ctx context.Context, page, limit int, search string) (*domain.PaginatedAliasResponse, error) {
	return s.repo.ListAllAliasesWithDetailsPaginated(ctx, page, limit, search)
}

func (s *AppService) CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error {
	return s.repo.CreateFullUser(ctx, customer, accounts, alias)
}

func (s *AppService) GetBanks(ctx context.Context) ([]domain.Bank, error) {
	return s.repo.ListBanks(ctx)
}
