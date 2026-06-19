package sqlite

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
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
	var createdAtStr string
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.LastName,
		&customer.Email,
		&customer.Phone,
		&createdAtStr,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	// Parsear la fecha de SQLite (string) a time.Time
	customer.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)

	return &customer, nil
}

// GetCustomerByVerificationData busca un cliente verificando que su cédula, correo y alias coincidan.
func (r *RealRepository) GetCustomerByVerificationData(ctx context.Context, documentNumber string, email string, aliasValue string) (*domain.Customer, error) {
	query := `
	SELECT c.id, c.document_type, c.document_number, c.first_name, c.last_name, c.email, c.phone, c.created_at 
	FROM customers c
	JOIN alias al ON c.id = al.customer_id
	WHERE c.document_number = ? AND c.email = ? AND al.alias_value = ?`

	row := r.db.QueryRowContext(ctx, query, documentNumber, email, aliasValue)

	var customer domain.Customer
	var createdAtStr string
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.LastName,
		&customer.Email,
		&customer.Phone,
		&createdAtStr,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	customer.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	return &customer, nil
}

// SaveAccount guarda una cuenta bancaria asociada a un cliente.
func (r *RealRepository) SaveAccount(ctx context.Context, account *domain.Account) error {
	query := `INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type, status, created_at)
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
		var createdAtStr string
		err := rows.Scan(&acc.ID, &acc.BankID, &acc.CustomerID, &acc.AccountNumber, &acc.AccountType, &acc.Status, &createdAtStr)
		if err != nil {
			return nil, err
		}
		acc.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
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
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AliasValue, &createdAtStr)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	alias.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	return &alias, nil
}

// DeleteAlias elimina físicamente el registro de la tabla por ID, liberando el alias.
func (r *RealRepository) DeleteAlias(ctx context.Context, id string) error {
	query := `DELETE FROM alias WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// ListAllAliases retorna el arreglo completo de alias registrados para el panel de control.
func (r *RealRepository) ListAllAliases(ctx context.Context) ([]domain.Alias, error) {

	query := `SELECT id, customer_id, alias_value, created_at FROM alias`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listAlias []domain.Alias
	for rows.Next() {
		var als domain.Alias
		var createdAtStr string
		err := rows.Scan(&als.ID, &als.CustomerID, &als.AliasValue, &createdAtStr)
		if err != nil {
			return nil, err
		}
		als.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		listAlias = append(listAlias, als)
	}
	return listAlias, nil
}

// ListAllAliasesWithDetails retorna el arreglo de alias con los detalles completos del usuario y sus bancos.
func (r *RealRepository) ListAllAliasesWithDetails(ctx context.Context) ([]domain.AliasDetail, error) {
	query := `
	SELECT 
		c.id, 
		c.document_number,
		c.first_name, 
		c.last_name, 
		al.alias_value, 
		c.email, 
		c.phone, 
		IFNULL(GROUP_CONCAT(b.name || '|' || ac.account_number), '') as accounts_data
	FROM alias al
	JOIN customers c ON al.customer_id = c.id
	LEFT JOIN accounts ac ON c.id = ac.customer_id
	LEFT JOIN banks b ON ac.bank_id = b.id
	GROUP BY c.id, al.alias_value
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listAliasDetail []domain.AliasDetail
	for rows.Next() {
		var detail domain.AliasDetail
		var accountsStr string

		err := rows.Scan(
			&detail.CustomerID,
			&detail.DocumentNumber,
			&detail.FirstName,
			&detail.LastName,
			&detail.AliasValue,
			&detail.Email,
			&detail.Phone,
			&accountsStr,
		)
		if err != nil {
			return nil, err
		}

		// Procesar la cadena concatenada de cuentas
		detail.Accounts = []domain.AccountDetail{}
		if accountsStr != "" {
			// accountsStr se ve así: "Banco de Venezuela|0102123,Bancamiga|0172456"
			accountPairs := strings.Split(accountsStr, ",")
			for _, pair := range accountPairs {
				parts := strings.Split(pair, "|")
				if len(parts) == 2 {
					detail.Accounts = append(detail.Accounts, domain.AccountDetail{
						Bank:          parts[0],
						AccountNumber: parts[1],
					})
				}
			}
		}

		listAliasDetail = append(listAliasDetail, detail)
	}
	return listAliasDetail, nil
}

func (r *RealRepository) CreateFullUser(ctx context.Context, customer *domain.Customer, accounts []domain.Account, alias *domain.Alias) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	// 1. Manejo Inteligente del Cliente (Upsert)
	// Primero verificamos si el cliente ya existe usando su cédula (document_type + document_number)
	var existingCustomerID string
	checkCustQuery := `SELECT id FROM customers WHERE document_type = ? AND document_number = ?`
	err = tx.QueryRowContext(ctx, checkCustQuery, customer.DocumentType, customer.DocumentNumber).Scan(&existingCustomerID)

	if err == sql.ErrNoRows {
		// El cliente NO existe. Lo insertamos como nuevo.
		queryCustomer := `INSERT INTO customers (id, document_type, document_number, first_name, last_name, email, phone, created_at) VALUES (?,?,?,?,?,?,?,?)`
		_, err = tx.ExecContext(ctx, queryCustomer, customer.ID, customer.DocumentType, customer.DocumentNumber, customer.FirstName, customer.LastName, customer.Email, customer.Phone, customer.CreatedAt)
		if err != nil {
			tx.Rollback()
			errStr := err.Error()
			if strings.Contains(errStr, "customers.document_number") {
				return fmt.Errorf("la cédula %s ya se encuentra registrada en otro cliente", customer.DocumentNumber)
			}
			if strings.Contains(errStr, "customers.email") {
				return fmt.Errorf("el correo electrónico %s ya está en uso", customer.Email)
			}
			if strings.Contains(errStr, "customers.phone") {
				return fmt.Errorf("el número de teléfono %s ya está en uso", customer.Phone)
			}
			return fmt.Errorf("error insertando nuevo cliente: %w", err)
		}
	} else if err != nil {
		// Ocurrió un error real en la base de datos
		tx.Rollback()
		return fmt.Errorf("error verificando cliente existente: %w", err)
	} else {
		// El cliente SÍ existe. Reemplazamos el ID nuevo generado en el handler por el ID real de la base de datos.
		customer.ID = existingCustomerID
	}

	// 2. Manejo Inteligente de las Cuentas
	for _, acc := range accounts {
		// Actualizamos el CustomerID de la cuenta por si cambió en el paso anterior
		acc.CustomerID = customer.ID

		// Verificamos si esta cuenta ya existe para este cliente y este banco
		var existingAccountID string
		checkAccQuery := `SELECT id FROM accounts WHERE customer_id = ? AND bank_id = ?`
		err = tx.QueryRowContext(ctx, checkAccQuery, acc.CustomerID, acc.BankID).Scan(&existingAccountID)

		if err == sql.ErrNoRows {
			// La cuenta NO existe. La insertamos.
			queryAcc := `INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type, status, created_at) VALUES (?,?,?,?,?,?,?)`
			_, err = tx.ExecContext(ctx, queryAcc, acc.ID, acc.BankID, acc.CustomerID, acc.AccountNumber, acc.AccountType, acc.Status, acc.CreatedAt)
			if err != nil {
				tx.Rollback()
				if strings.Contains(err.Error(), "accounts.account_number") {
					return fmt.Errorf("el número de cuenta %s ya se encuentra registrado en el sistema", acc.AccountNumber)
				}
				if strings.Contains(err.Error(), "FOREIGN KEY constraint failed") {
					return fmt.Errorf("el banco con ID '%s' no existe en el sistema", acc.BankID)
				}
				return fmt.Errorf("error insertando nueva cuenta: %w", err)
			}
		} else if err != nil {
			tx.Rollback()
			return fmt.Errorf("error verificando cuenta existente: %w", err)
		}
		// Si la cuenta ya existe, simplemente la ignoramos y no hacemos el INSERT
	}

	// 3. Manejo del Alias
	// Actualizamos el CustomerID del alias por si cambió en el paso 1
	alias.CustomerID = customer.ID

	queryAlias := `INSERT INTO alias (id, customer_id, alias_value, created_at) VALUES (?,?,?,?)`
	_, err = tx.ExecContext(ctx, queryAlias, alias.ID, alias.CustomerID, alias.AliasValue, alias.CreatedAt)
	if err != nil {
		tx.Rollback()
		errStr := err.Error()
		if strings.Contains(errStr, "alias.alias_value") {
			return fmt.Errorf("el alias '%s' ya está en uso por otro usuario", alias.AliasValue)
		}
		if strings.Contains(errStr, "alias.customer_id") {
			return fmt.Errorf("este usuario ya tiene un alias registrado, solo se permite uno por cliente")
		}
		return fmt.Errorf("error insertando alias: %w", err)
	}

	return tx.Commit()
}
