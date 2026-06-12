package sqlite

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
	"database/sql"
)

type RealRepository struct {
	db *sql.DB
}

func NewSQLiteRepo(db *sql.DB) *RealRepository {
	return &RealRepository{
		db: db,
	}
}

// SaveCustomer inserta un nuevo cliente en la base de datos de SQLite.
func (r *RealRepository) SaveCustomer(ctx context.Context, customer *domain.Customer) error {
	query := `INSERT INTO customers (id, document_type, document_number, first_name, last_name, email, phone, created_at
	VALUES (?,?,?,?,?,?,?,?))`

	_, err := r.db.ExecContext(ctx, query,
		customer.ID,
		customer.DocumentType,
		customer.DocumentNumber,
		customer.FirstName,
		customer.LastName,
		customer.Email,
		customer.Phone,
		customer.CreatedAt,
	)
	return err
}

// GetCustomerByID busca un cliente por su identificador único.
func (r *RealRepository) GetCustomerByID(ctx context.Context, id string) (*domain.Customer, error) {
	query := `SELECT id, document_type, document_number, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?`
	row := r.db.QueryRowContext(ctx, query, id)

	var customer domain.Customer
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.LastName,
		&customer.Email,
		&customer.Phone,
		&customer.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

// SaveAccount guarda una cuenta bancaria asociada a un cliente.
func (r *RealRepository) SaveAccount(ctx context.Context, account *domain.Account) error {
	query := `INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type, status, created_at
	VALUES (?,?,?,?,?,?,?)`

	_, err := r.db.ExecContext(ctx, query,
		account.ID,
		account.BankID,
		account.CustomerID,
		account.AccountNumber,
		account.AccountType,
		account.Status,
		account.CreatedAt,
	)
	return err
}

// GetAccountsByCustomerID obtiene todas las cuentas bancarias que le pertenecen a un cliente.
func (r *RealRepository) GetAccountsByCustomerID(ctx context.Context, customerID string) ([]domain.Account, error) {
	query := `SELECT id, bank_id, customer_id, account_number, account_type, status, created_at FROM accounts WHERE customer_id = ?`
	rows, err := r.db.QueryContext(ctx, query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []domain.Account
	for rows.Next() {
		var acc domain.Account
		err := rows.Scan(&acc.ID, &acc.BankID, &acc.CustomerID, &acc.AccountNumber, &acc.AccountType, &acc.Status, &acc.CreatedAt)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, acc)
	}
	return accounts, nil
}

// SaveAlias almacena de forma física el registro del alias en el sistema.
func (r *RealRepository) SaveAlias(ctx context.Context, alias *domain.Alias) error {
	query := `INSERT INTO alias (id, customer_id, alias_value, created_at) 
	VALUES (?,?,?,?)`

	_, err := r.db.ExecContext(ctx, query,
		alias.ID,
		alias.CustomerID,
		alias.AliasValue,
		alias.CreatedAt,
	)
	return err
}

// GetAliasByValue busca la coincidencia exacta de un alias por su valor de texto.
func (r *RealRepository) GetAliasByValue(ctx context.Context, value string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, alias_value, created_at FROM alias WHERE alias_value = ?`
	row := r.db.QueryRowContext(ctx, query, value)

	var alias domain.Alias
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AliasValue, &alias.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &alias, nil
}

// DeleteAlias elimina físicamente el registro de la tabla por ID, liberando el alias.
func (r *RealRepository) DeleteAlias(ctx context.Context, id string) error {
	query := `DELETE FROM alias WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// ListAllAlias retorna el arreglo completo de alias registrados para el panel de control.
func (r *RealRepository) ListAllAlias(ctx context.Context) ([]domain.Alias, error) {

	query := `SELECT id, customer_id, alias_value, created_at FROM alias`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listAlias []domain.Alias
	for rows.Next() {
		var als domain.Alias
		err := rows.Scan(&als.ID, &als.CustomerID, &als.AliasValue, &als.CreatedAt)
		if err != nil {
			return nil, err
		}
		listAlias = append(listAlias, als)
	}
	return listAlias, nil
}
