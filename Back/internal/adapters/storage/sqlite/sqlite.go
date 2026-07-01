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

// GetCustomerByDocument busca un cliente por document_type y document_number.
func (r *RealRepository) GetCustomerByDocument(ctx context.Context, documentType, documentNumber string) (*domain.Customer, error) {
	query := `SELECT id, document_type, document_number, first_name, last_name, email, phone, created_at
	FROM customers WHERE document_type = ? AND document_number = ?`
	row := r.db.QueryRowContext(ctx, query, documentType, documentNumber)

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

// UpdateAccountStatus actualiza el status de una cuenta por su ID.
func (r *RealRepository) UpdateAccountStatus(ctx context.Context, accountID, status string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE accounts SET status = ? WHERE id = ?`, status, accountID)
	return err
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
	query := `SELECT id, customer_id, alias_value, COALESCE(status, 'ENABLED'), created_at FROM alias WHERE alias_value = ?`
	row := r.db.QueryRowContext(ctx, query, value)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AliasValue, &alias.Status, &createdAtStr)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	alias.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	return &alias, nil
}

// UpdateAliasStatus actualiza el estado global del alias en el core.
func (r *RealRepository) UpdateAliasStatus(ctx context.Context, aliasID, status string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE alias SET status = ? WHERE id = ?`, status, aliasID)
	return err
}

// GetAliasByCustomerID busca el alias asociado a un cliente (relación 1:1).
func (r *RealRepository) GetAliasByCustomerID(ctx context.Context, customerID string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, alias_value, created_at FROM alias WHERE customer_id = ?`
	row := r.db.QueryRowContext(ctx, query, customerID)

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

// GetAliasByID busca un alias por su identificador interno.
func (r *RealRepository) GetAliasByID(ctx context.Context, id string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, alias_value, created_at FROM alias WHERE id = ?`
	row := r.db.QueryRowContext(ctx, query, id)

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

// DeleteCustomerByID elimina un cliente; alias y cuentas se borran en cascada por FK.
func (r *RealRepository) DeleteCustomerByID(ctx context.Context, customerID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM customers WHERE id = ?`, customerID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("cliente no encontrado")
	}
	return nil
}

// DeleteAllCustomers elimina todos los clientes; alias y cuentas asociadas se borran en cascada.
func (r *RealRepository) DeleteAllCustomers(ctx context.Context) (int64, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM customers`)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// DeleteAlias elimina el alias y todos los datos relacionados (cliente y cuentas).
func (r *RealRepository) DeleteAlias(ctx context.Context, id string) error {
	alias, err := r.GetAliasByID(ctx, id)
	if err != nil {
		return err
	}
	if alias == nil {
		return fmt.Errorf("alias no encontrado")
	}
	return r.DeleteCustomerByID(ctx, alias.CustomerID)
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

// ListBanks retorna todos los bancos disponibles ordenados por nombre.
func (r *RealRepository) ListBanks(ctx context.Context) ([]domain.Bank, error) {
	query := `SELECT id, name FROM banks ORDER BY name`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	banks := make([]domain.Bank, 0)
	for rows.Next() {
		var bank domain.Bank
		if err := rows.Scan(&bank.ID, &bank.Name); err != nil {
			return nil, err
		}
		banks = append(banks, bank)
	}
	return banks, nil
}

func parseAccountDetails(accountsStr string) []domain.AccountDetail {
	if accountsStr == "" {
		return []domain.AccountDetail{}
	}

	accounts := make([]domain.AccountDetail, 0)
	for _, pair := range strings.Split(accountsStr, ",") {
		parts := strings.Split(pair, "|")
		if len(parts) == 2 {
			accounts = append(accounts, domain.AccountDetail{
				Bank:          parts[0],
				AccountNumber: parts[1],
			})
		}
	}
	return accounts
}

func aliasSearchFilter(search string) (string, []interface{}) {
	term := strings.TrimSpace(search)
	if term == "" {
		return "", nil
	}

	pattern := "%" + term + "%"
	filter := `
		AND (
			al.alias_value LIKE ? OR
			c.first_name LIKE ? OR
			c.last_name LIKE ? OR
			c.document_number LIKE ? OR
			(c.document_type || '-' || c.document_number) LIKE ?
		)`

	return filter, []interface{}{pattern, pattern, pattern, pattern, pattern}
}

// ListAllAliasesWithDetailsPaginated retorna alias con detalle usando LIMIT/OFFSET.
func (r *RealRepository) ListAllAliasesWithDetailsPaginated(ctx context.Context, page, limit int, search string) (*domain.PaginatedAliasResponse, error) {
	searchFilter, searchArgs := aliasSearchFilter(search)

	// Cada cliente tiene un solo alias (customer_id UNIQUE), no hace falta GROUP BY para contar.
	countQuery := `
	SELECT COUNT(*)
	FROM alias al
	JOIN customers c ON al.customer_id = c.id
	WHERE 1=1` + searchFilter

	var totalRecords int
	if err := r.db.QueryRowContext(ctx, countQuery, searchArgs...).Scan(&totalRecords); err != nil {
		return nil, err
	}

	totalPages := 0
	if totalRecords > 0 {
		totalPages = (totalRecords + limit - 1) / limit
	}

	offset := (page - 1) * limit
	// Primero paginamos IDs; luego unimos cuentas solo para esa página.
	query := `
	SELECT 
		c.id, 
		c.document_type,
		c.document_number,
		c.first_name, 
		c.last_name, 
		al.alias_value, 
		c.email, 
		c.phone, 
		IFNULL(GROUP_CONCAT(b.name || '|' || ac.account_number), '') as accounts_data
	FROM (
		SELECT al.customer_id
		FROM alias al
		JOIN customers c ON al.customer_id = c.id
		WHERE 1=1` + searchFilter + `
		ORDER BY c.first_name, c.last_name, al.alias_value
		LIMIT ? OFFSET ?
	) page
	JOIN customers c ON c.id = page.customer_id
	JOIN alias al ON al.customer_id = c.id
	LEFT JOIN accounts ac ON c.id = ac.customer_id
	LEFT JOIN banks b ON ac.bank_id = b.id
	GROUP BY c.id, al.alias_value
	ORDER BY c.first_name, c.last_name, al.alias_value
	`
	queryArgs := append(append([]interface{}{}, searchArgs...), limit, offset)
	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	data := make([]domain.AliasDetail, 0)
	for rows.Next() {
		var detail domain.AliasDetail
		var accountsStr string

		err := rows.Scan(
			&detail.CustomerID,
			&detail.DocumentType,
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

		detail.Accounts = parseAccountDetails(accountsStr)
		data = append(data, detail)
	}

	return &domain.PaginatedAliasResponse{
		Data: data,
		Pagination: domain.PaginationMeta{
			Page:         page,
			Limit:        limit,
			TotalRecords: totalRecords,
			TotalPages:   totalPages,
		},
	}, nil
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
