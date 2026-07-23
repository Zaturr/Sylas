package sqlite

import (
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/validations"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
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
	query := `INSERT INTO customers (id, document_type, document_number, first_name, middle_name, last_name, second_last_name, email, phone, created_at)
	VALUES (?,?,?,?,?,?,?,?,?,?)`

	_, err := r.db.ExecContext(ctx, query,
		customer.ID,
		customer.DocumentType,
		customer.DocumentNumber,
		customer.FirstName,
		customer.MiddleName,
		customer.LastName,
		customer.SecondLastName,
		customer.Email,
		customer.Phone,
		customer.CreatedAt,
	)
	return err
}

// GetCustomerByID busca un cliente por su identificador único.
func (r *RealRepository) GetCustomerByID(ctx context.Context, id string) (*domain.Customer, error) {
	query := `SELECT id, document_type, document_number, first_name, COALESCE(middle_name, ''), last_name, COALESCE(second_last_name, ''), email, phone, created_at FROM customers WHERE id = ?`
	row := r.db.QueryRowContext(ctx, query, id)

	var customer domain.Customer
	var createdAtStr string
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.MiddleName,
		&customer.LastName,
		&customer.SecondLastName,
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
	query := `SELECT id, document_type, document_number, first_name, COALESCE(middle_name, ''), last_name, COALESCE(second_last_name, ''), email, phone, created_at
	FROM customers WHERE document_type = ? AND document_number = ?`
	row := r.db.QueryRowContext(ctx, query, documentType, documentNumber)

	var customer domain.Customer
	var createdAtStr string
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.MiddleName,
		&customer.LastName,
		&customer.SecondLastName,
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

// GetCustomerByDocumentNumber busca un cliente solo por document_number.
func (r *RealRepository) GetCustomerByDocumentNumber(ctx context.Context, documentNumber string) (*domain.Customer, error) {
	query := `SELECT id, document_type, document_number, first_name, COALESCE(middle_name, ''), last_name, COALESCE(second_last_name, ''), email, phone, created_at
	FROM customers WHERE document_number = ?`
	row := r.db.QueryRowContext(ctx, query, documentNumber)

	var customer domain.Customer
	var createdAtStr string
	err := row.Scan(
		&customer.ID,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.FirstName,
		&customer.MiddleName,
		&customer.LastName,
		&customer.SecondLastName,
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
	SELECT c.id, c.document_type, c.document_number, c.first_name, COALESCE(c.middle_name, ''), c.last_name, COALESCE(c.second_last_name, ''), c.email, c.phone, c.created_at 
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
		&customer.MiddleName,
		&customer.LastName,
		&customer.SecondLastName,
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
	query := `INSERT INTO alias (id, customer_id, account_id, alias_value, created_at) 
	VALUES (?,?,?,?,?)`

	_, err := r.db.ExecContext(ctx, query,
		alias.ID,
		alias.CustomerID,
		alias.AccountID,
		alias.AliasValue,
		alias.CreatedAt,
	)
	if err != nil {
		return err
	}

	if strings.TrimSpace(alias.AccountID) != "" {
		return r.syncAliasBankLinkForAccount(ctx, alias.ID, alias.AccountID, alias.CreatedAt)
	}

	return nil
}

// GetAliasByValue busca la coincidencia exacta de un alias por su valor de texto.
func (r *RealRepository) GetAliasByValue(ctx context.Context, value string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, account_id, alias_value, COALESCE(status, 'ENABLED'), created_at FROM alias WHERE alias_value = ?`
	row := r.db.QueryRowContext(ctx, query, value)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &alias.Status, &createdAtStr)
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

// UpdateAliasAccount actualiza la cuenta a la que está vinculado un alias
func (r *RealRepository) UpdateAliasAccount(ctx context.Context, aliasValue, accountID string) error {
	alias, err := r.GetAliasByValue(ctx, aliasValue)
	if err != nil {
		return err
	}
	if alias == nil {
		return fmt.Errorf("alias no encontrado")
	}

	var accountCustomerID string
	err = r.db.QueryRowContext(ctx, `SELECT customer_id FROM accounts WHERE id = ?`, accountID).Scan(&accountCustomerID)
	if err == sql.ErrNoRows {
		return fmt.Errorf("cuenta no encontrada")
	}
	if err != nil {
		return err
	}
	if accountCustomerID != alias.CustomerID {
		return fmt.Errorf("la cuenta no pertenece al titular del alias")
	}

	var bankID string
	err = r.db.QueryRowContext(ctx, `SELECT bank_id FROM accounts WHERE id = ?`, accountID).Scan(&bankID)
	if err != nil {
		return err
	}

	_, err = r.db.ExecContext(ctx, `UPDATE alias SET account_id = ? WHERE alias_value = ?`, accountID, aliasValue)
	if err != nil {
		return err
	}

	return r.UpsertAliasBankLink(ctx, &domain.AliasBankLink{
		ID:        uuid.New().String(),
		AliasID:   alias.ID,
		BankID:    bankID,
		AccountID: accountID,
		CreatedAt: time.Now(),
	})
}

func (r *RealRepository) syncAliasBankLinkForAccount(
	ctx context.Context,
	aliasID, accountID string,
	createdAt time.Time,
) error {
	var bankID string
	err := r.db.QueryRowContext(ctx, `SELECT bank_id FROM accounts WHERE id = ?`, accountID).Scan(&bankID)
	if err != nil {
		return err
	}

	return r.UpsertAliasBankLink(ctx, &domain.AliasBankLink{
		ID:        uuid.New().String(),
		AliasID:   aliasID,
		BankID:    bankID,
		AccountID: accountID,
		CreatedAt: createdAt,
	})
}

func (r *RealRepository) syncAliasBankLinkForAccountTx(
	ctx context.Context,
	tx *sql.Tx,
	aliasID, accountID string,
	createdAt time.Time,
) error {
	var bankID string
	err := tx.QueryRowContext(ctx, `SELECT bank_id FROM accounts WHERE id = ?`, accountID).Scan(&bankID)
	if err != nil {
		return err
	}

	return r.upsertAliasBankLinkTx(ctx, tx, &domain.AliasBankLink{
		ID:        uuid.New().String(),
		AliasID:   aliasID,
		BankID:    bankID,
		AccountID: accountID,
		CreatedAt: createdAt,
	})
}

func (r *RealRepository) upsertAliasBankLinkTx(
	ctx context.Context,
	tx *sql.Tx,
	link *domain.AliasBankLink,
) error {
	query := `
	INSERT INTO alias_bank_links (id, alias_id, bank_id, account_id, created_at)
	VALUES (?, ?, ?, ?, ?)
	ON CONFLICT(alias_id, bank_id) DO UPDATE SET
		account_id = excluded.account_id`

	_, err := tx.ExecContext(ctx, query,
		link.ID,
		link.AliasID,
		link.BankID,
		link.AccountID,
		link.CreatedAt,
	)
	return err
}

// UpsertAliasBankLink crea o actualiza el vínculo alias-cuenta para un banco.
func (r *RealRepository) UpsertAliasBankLink(ctx context.Context, link *domain.AliasBankLink) error {
	query := `
	INSERT INTO alias_bank_links (id, alias_id, bank_id, account_id, created_at)
	VALUES (?, ?, ?, ?, ?)
	ON CONFLICT(alias_id, bank_id) DO UPDATE SET
		account_id = excluded.account_id`

	_, err := r.db.ExecContext(ctx, query,
		link.ID,
		link.AliasID,
		link.BankID,
		link.AccountID,
		link.CreatedAt,
	)
	return err
}

// SyncAliasBankLinksFromAccounts registra un vínculo por banco usando la primera
// cuenta no-dólares de cada banco. Usado en escenarios demo multi-banco.
func (r *RealRepository) SyncAliasBankLinksFromAccounts(
	ctx context.Context,
	aliasID string,
	accounts []domain.Account,
) error {
	linkedByBank := make(map[string]string)

	for _, account := range accounts {
		if domain.IsDollarAccount(account.AccountType) {
			continue
		}
		if _, exists := linkedByBank[account.BankID]; exists {
			continue
		}
		linkedByBank[account.BankID] = account.ID
	}

	now := time.Now()
	for bankID, accountID := range linkedByBank {
		if err := r.UpsertAliasBankLink(ctx, &domain.AliasBankLink{
			ID:        uuid.New().String(),
			AliasID:   aliasID,
			BankID:    bankID,
			AccountID: accountID,
			CreatedAt: now,
		}); err != nil {
			return err
		}
	}

	return nil
}

// GetAliasBankLinksByAliasID devuelve todos los vínculos alias-banco-cuenta.
func (r *RealRepository) GetAliasBankLinksByAliasID(ctx context.Context, aliasID string) ([]domain.AliasBankLink, error) {
	query := `SELECT id, alias_id, bank_id, account_id, created_at
	FROM alias_bank_links
	WHERE alias_id = ?
	ORDER BY bank_id`

	rows, err := r.db.QueryContext(ctx, query, aliasID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanAliasBankLinks(rows)
}

// GetAliasBankLinksByAliasValue devuelve vínculos buscando por valor del alias.
func (r *RealRepository) GetAliasBankLinksByAliasValue(ctx context.Context, aliasValue string) ([]domain.AliasBankLink, error) {
	query := `SELECT abl.id, abl.alias_id, abl.bank_id, abl.account_id, abl.created_at
	FROM alias_bank_links abl
	JOIN alias al ON al.id = abl.alias_id
	WHERE al.alias_value = ?
	ORDER BY abl.bank_id`

	rows, err := r.db.QueryContext(ctx, query, aliasValue)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanAliasBankLinks(rows)
}

func scanAliasBankLinks(rows *sql.Rows) ([]domain.AliasBankLink, error) {
	links := make([]domain.AliasBankLink, 0)
	for rows.Next() {
		var link domain.AliasBankLink
		var createdAtStr string
		if err := rows.Scan(&link.ID, &link.AliasID, &link.BankID, &link.AccountID, &createdAtStr); err != nil {
			return nil, err
		}
		link.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		links = append(links, link)
	}
	return links, nil
}

// activeAliasSQLFilter excluye alias con baja global (BLKD) para tope AG01 / alta de uno nuevo.
const activeAliasSQLFilter = `UPPER(COALESCE(status, 'ENABLED')) NOT IN ('BLKD', 'DISABLED', 'BLOCKED')`

// currentAliasJoinCondition une el alias más reciente del titular (incluye BLKD hasta que se registre otro).
const currentAliasJoinCondition = `al.id = (
	SELECT al2.id FROM alias al2
	WHERE al2.customer_id = c.id
	ORDER BY al2.created_at DESC
	LIMIT 1
)`

// GetActiveAliasByCustomerID devuelve el alias operativo del titular (sin BLKD/DISABLED).
func (r *RealRepository) GetActiveAliasByCustomerID(ctx context.Context, customerID string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, account_id, alias_value, COALESCE(status, 'ENABLED'), created_at
	FROM alias
	WHERE customer_id = ? AND ` + activeAliasSQLFilter + `
	ORDER BY created_at DESC
	LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, customerID)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &alias.Status, &createdAtStr)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	alias.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	return &alias, nil
}

// GetAliasByCustomerID devuelve el alias más reciente del titular (incluye BLKD).
func (r *RealRepository) GetAliasByCustomerID(ctx context.Context, customerID string) (*domain.Alias, error) {
	query := `SELECT id, customer_id, account_id, alias_value, COALESCE(status, 'ENABLED'), created_at
	FROM alias
	WHERE customer_id = ?
	ORDER BY created_at DESC
	LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, customerID)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &alias.Status, &createdAtStr)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	alias.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	return &alias, nil
}

// ListAliasesByCustomerID devuelve todos los alias del titular (J/G/C multi-alias).
func (r *RealRepository) ListAliasesByCustomerID(ctx context.Context, customerID string) ([]domain.Alias, error) {
	query := `SELECT id, customer_id, account_id, alias_value, COALESCE(status, 'ENABLED'), created_at
	FROM alias
	WHERE customer_id = ?
	ORDER BY created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	aliases := make([]domain.Alias, 0)
	for rows.Next() {
		var alias domain.Alias
		var createdAtStr string
		if err := rows.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &alias.Status, &createdAtStr); err != nil {
			return nil, err
		}
		alias.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		aliases = append(aliases, alias)
	}
	return aliases, nil
}

// GetAliasByAccountID devuelve el alias vinculado a una cuenta (1 alias por cuenta).
func (r *RealRepository) GetAliasByAccountID(ctx context.Context, accountID string) (*domain.Alias, error) {
	accountID = strings.TrimSpace(accountID)
	if accountID == "" {
		return nil, nil
	}

	query := `SELECT id, customer_id, account_id, alias_value, COALESCE(status, 'ENABLED'), created_at
	FROM alias
	WHERE account_id = ?
	LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, accountID)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &alias.Status, &createdAtStr)
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
	query := `SELECT id, customer_id, account_id, alias_value, created_at FROM alias WHERE id = ?`
	row := r.db.QueryRowContext(ctx, query, id)

	var alias domain.Alias
	var createdAtStr string
	err := row.Scan(&alias.ID, &alias.CustomerID, &alias.AccountID, &alias.AliasValue, &createdAtStr)
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

	query := `SELECT id, customer_id, account_id, alias_value, created_at FROM alias`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listAlias []domain.Alias
	for rows.Next() {
		var als domain.Alias
		var createdAtStr string
		err := rows.Scan(&als.ID, &als.CustomerID, &als.AccountID, &als.AliasValue, &createdAtStr)
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
		if len(parts) < 3 {
			continue
		}
		isLinked := len(parts) >= 4 && parts[3] == "1"
		accounts = append(accounts, domain.AccountDetail{
			Bank:          parts[0],
			AccountNumber: parts[1],
			Status:        parts[2],
			IsLinked:      isLinked,
		})
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
			c.first_name LIKE ? OR
			c.last_name LIKE ? OR
			c.document_number LIKE ? OR
			(c.document_type || '-' || c.document_number) LIKE ? OR
			COALESCE(al.alias_value, '') LIKE ?
		)`

	return filter, []interface{}{pattern, pattern, pattern, pattern, pattern}
}

func customerSearchFilter(search string) (string, []interface{}) {
	term := strings.TrimSpace(search)
	if term == "" {
		return "", nil
	}

	pattern := "%" + term + "%"
	filter := `
		AND (
			c.first_name LIKE ? OR
			c.last_name LIKE ? OR
			c.document_number LIKE ? OR
			(c.document_type || '-' || c.document_number) LIKE ?
		)`

	return filter, []interface{}{pattern, pattern, pattern, pattern}
}

func schemeDocumentTypeFilter(scheme string) (string, []interface{}) {
	normalized := strings.ToUpper(strings.TrimSpace(scheme))
	switch normalized {
	case "SCID":
		return ` AND UPPER(TRIM(c.document_type)) IN (?, ?)`, []interface{}{"V", "E"}
	case "SRIF":
		return ` AND UPPER(TRIM(c.document_type)) IN (?, ?, ?)`, []interface{}{"J", "G", "C"}
	case "SPAS":
		return ` AND UPPER(TRIM(c.document_type)) IN (?)`, []interface{}{"P"}
	default:
		return "", nil
	}
}

// ListAllAliasesWithDetailsPaginated retorna:
// - 1 fila por cada alias registrado (multi-alias jurídico = varias filas del mismo titular)
// - 1 fila por titular sin alias (UNRG); nunca una fila por cuenta bancaria
func (r *RealRepository) ListAllAliasesWithDetailsPaginated(ctx context.Context, page, limit int, search string, scheme string) (*domain.PaginatedAliasResponse, error) {
	aliasSearchFilterSQL, aliasSearchArgs := aliasSearchFilter(search)
	customerSearchFilterSQL, customerSearchArgs := customerSearchFilter(search)
	schemeFilterSQL, schemeArgs := schemeDocumentTypeFilter(scheme)

	countQuery := `
	SELECT COUNT(*) FROM (
		SELECT al.id
		FROM customers c
		INNER JOIN alias al ON al.customer_id = c.id
		WHERE 1=1` + aliasSearchFilterSQL + schemeFilterSQL + `
		UNION ALL
		SELECT c.id
		FROM customers c
		WHERE NOT EXISTS (SELECT 1 FROM alias al2 WHERE al2.customer_id = c.id)
		AND 1=1` + customerSearchFilterSQL + schemeFilterSQL + `
	)`

	countArgs := append([]interface{}{}, aliasSearchArgs...)
	countArgs = append(countArgs, schemeArgs...)
	countArgs = append(countArgs, customerSearchArgs...)
	countArgs = append(countArgs, schemeArgs...)
	var totalRecords int
	if err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&totalRecords); err != nil {
		return nil, err
	}

	totalPages := 0
	if totalRecords > 0 {
		totalPages = (totalRecords + limit - 1) / limit
	}

	offset := (page - 1) * limit
	query := `
	SELECT 
		c.id, 
		c.document_type,
		c.document_number,
		c.first_name, 
		c.middle_name,
		c.last_name, 
		c.second_last_name,
		COALESCE(al.alias_value, '') AS alias_value,
		CASE
			WHEN al.id IS NULL THEN '` + domain.AliasStatusUnregistered + `'
			ELSE COALESCE(al.status, '` + domain.AliasStatusEnabled + `')
		END AS alias_status,
		c.email, 
		c.phone, 
		IFNULL(
			GROUP_CONCAT(ac.bank_id || '|' || ac.account_number || '|' || ac.status || '|' || CASE
				WHEN al.id IS NOT NULL AND ac.id = al.account_id THEN '1'
				ELSE '0'
			END),
			''
		) AS accounts_data
	FROM (
		SELECT customer_id, alias_id FROM (
			SELECT c.id AS customer_id, al.id AS alias_id, c.first_name, c.last_name, al.alias_value
			FROM customers c
			INNER JOIN alias al ON al.customer_id = c.id
			WHERE 1=1` + aliasSearchFilterSQL + schemeFilterSQL + `
			UNION ALL
			SELECT c.id, NULL, c.first_name, c.last_name, ''
			FROM customers c
			WHERE NOT EXISTS (SELECT 1 FROM alias al2 WHERE al2.customer_id = c.id)
			AND 1=1` + customerSearchFilterSQL + schemeFilterSQL + `
		)
		ORDER BY first_name, last_name, COALESCE(alias_value, '')
		LIMIT ? OFFSET ?
	) page
	JOIN customers c ON c.id = page.customer_id
	LEFT JOIN alias al ON al.id = page.alias_id
	LEFT JOIN accounts ac ON c.id = ac.customer_id
	GROUP BY c.id, al.id, al.alias_value, al.status
	ORDER BY c.first_name, c.last_name, COALESCE(al.alias_value, '')
	`

	queryArgs := append([]interface{}{}, aliasSearchArgs...)
	queryArgs = append(queryArgs, schemeArgs...)
	queryArgs = append(queryArgs, customerSearchArgs...)
	queryArgs = append(queryArgs, schemeArgs...)
	queryArgs = append(queryArgs, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	data := make([]domain.AliasDetail, 0)
	for rows.Next() {
		var detail domain.AliasDetail
		var accountsStr string
		var middleName sql.NullString
		var secondLastName sql.NullString

		err := rows.Scan(
			&detail.CustomerID,
			&detail.DocumentType,
			&detail.DocumentNumber,
			&detail.FirstName,
			&middleName,
			&detail.LastName,
			&secondLastName,
			&detail.AliasValue,
			&detail.AliasStatus,
			&detail.Email,
			&detail.Phone,
			&accountsStr,
		)
		if err != nil {
			return nil, err
		}

		detail.MiddleName = middleName.String
		detail.SecondLastName = secondLastName.String
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
		if strings.TrimSpace(customer.Email) == "" {
			customer.Email = validations.BuildGmailFromCustomer(
				customer.FirstName,
				customer.MiddleName,
				customer.LastName,
				customer.SecondLastName,
				customer.DocumentNumber,
			)
		} else {
			customer.Email = validations.EnsureGmailAddress(customer.Email)
		}
		if strings.TrimSpace(customer.Phone) == "" {
			customer.Phone = validations.BuildVenezuelanPhoneFromDocument(customer.DocumentNumber)
		}
		queryCustomer := `INSERT INTO customers (id, document_type, document_number, first_name, middle_name, last_name, second_last_name, email, phone, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`
		_, err = tx.ExecContext(ctx, queryCustomer, customer.ID, customer.DocumentType, customer.DocumentNumber, customer.FirstName, customer.MiddleName, customer.LastName, customer.SecondLastName, customer.Email, customer.Phone, customer.CreatedAt)
		if err != nil {
			tx.Rollback()
			errStr := err.Error()
			if strings.Contains(errStr, "customers.document_number") ||
				strings.Contains(errStr, "customers.document_type, customers.document_number") {
				return fmt.Errorf("la cédula %s-%s ya se encuentra registrada en otro cliente", customer.DocumentType, customer.DocumentNumber)
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
	isLegalEntity := domain.IsLegalEntityDocumentType(customer.DocumentType)
	for i := range accounts {
		accounts[i].CustomerID = customer.ID

		var existingAccountID string
		if isLegalEntity {
			err = tx.QueryRowContext(ctx, `SELECT id FROM accounts WHERE account_number = ?`, accounts[i].AccountNumber).Scan(&existingAccountID)
		} else {
			err = tx.QueryRowContext(ctx, `SELECT id FROM accounts WHERE customer_id = ? AND bank_id = ? AND account_type = ?`,
				accounts[i].CustomerID, accounts[i].BankID, accounts[i].AccountType).Scan(&existingAccountID)
		}

		if err == sql.ErrNoRows {
			// La cuenta NO existe. La insertamos.
			queryAcc := `INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type, status, created_at) VALUES (?,?,?,?,?,?,?)`
			_, err = tx.ExecContext(ctx, queryAcc, accounts[i].ID, accounts[i].BankID, accounts[i].CustomerID, accounts[i].AccountNumber, accounts[i].AccountType, accounts[i].Status, accounts[i].CreatedAt)
			if err != nil {
				tx.Rollback()
				if strings.Contains(err.Error(), "accounts.account_number") {
					return fmt.Errorf("el número de cuenta %s ya se encuentra registrado en el sistema", accounts[i].AccountNumber)
				}
				if strings.Contains(err.Error(), "FOREIGN KEY constraint failed") {
					return fmt.Errorf("el banco con ID '%s' no existe en el sistema", accounts[i].BankID)
				}
				return fmt.Errorf("error insertando nueva cuenta: %w", err)
			}
		} else if err != nil {
			tx.Rollback()
			return fmt.Errorf("error verificando cuenta existente: %w", err)
		} else {
			// La cuenta ya existe. Actualizamos su estado para forzar la regla de negocio.
			queryUpdateAcc := `UPDATE accounts SET status = ? WHERE id = ?`
			_, err = tx.ExecContext(ctx, queryUpdateAcc, accounts[i].Status, existingAccountID)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("error actualizando estado de cuenta existente: %w", err)
			}
			// ¡ACTUALIZAMOS EL ID AL ID EXISTENTE PARA NO ROMPER LA LLAVE FORÁNEA DEL ALIAS!
			accounts[i].ID = existingAccountID
		}
	}

	// 3. Manejo del Alias (solo si el usuario envió un valor)
	if alias != nil {
		aliasValue := strings.TrimSpace(alias.AliasValue)
		if aliasValue != "" {
			alias.CustomerID = customer.ID
			alias.AliasValue = aliasValue

			defaultAccountID := resolveAliasAccountID(alias.AccountID, accounts)
			alias.AccountID = defaultAccountID

			if defaultAccountID != "" {
				var existingAliasID string
				accCheckErr := tx.QueryRowContext(ctx, `SELECT id FROM alias WHERE account_id = ? AND trim(account_id) != ''`, defaultAccountID).Scan(&existingAliasID)
				if accCheckErr == nil {
					tx.Rollback()
					return fmt.Errorf("la cuenta ya tiene un alias asociado")
				}
				if accCheckErr != sql.ErrNoRows {
					tx.Rollback()
					return fmt.Errorf("error verificando alias de la cuenta: %w", accCheckErr)
				}
			}

			aliasStatus := strings.TrimSpace(alias.Status)
			if aliasStatus == "" {
				aliasStatus = domain.AliasStatusEnabled
			}
			queryAlias := `INSERT INTO alias (id, customer_id, account_id, alias_value, status, created_at) VALUES (?,?,?,?,?,?)`
			_, err = tx.ExecContext(ctx, queryAlias, alias.ID, alias.CustomerID, alias.AccountID, alias.AliasValue, aliasStatus, alias.CreatedAt)
			if err != nil {
				tx.Rollback()
				errStr := err.Error()
				if strings.Contains(errStr, "alias.alias_value") {
					return fmt.Errorf("el alias '%s' ya está en uso por otro usuario", alias.AliasValue)
				}
				if strings.Contains(errStr, "idx_alias_one_per_account") {
					return fmt.Errorf("la cuenta ya tiene un alias asociado")
				}
				if strings.Contains(errStr, "alias.customer_id") ||
					strings.Contains(errStr, "idx_alias_one_active_per_customer") {
					return fmt.Errorf("este usuario ya tiene un alias activo registrado")
				}
				return fmt.Errorf("error insertando alias: %w", err)
			}

			if strings.TrimSpace(alias.AccountID) != "" {
				if err := r.syncAliasBankLinkForAccountTx(ctx, tx, alias.ID, alias.AccountID, alias.CreatedAt); err != nil {
					tx.Rollback()
					return fmt.Errorf("error vinculando alias con cuenta del banco: %w", err)
				}
			}
		}
	}

	return tx.Commit()
}

// resolveAliasAccountID enlaza el alias a una cuenta real del titular.
// Si el ID entrante no coincide (p. ej. UUID placeholder del mapper SIMF), usa la primera elegible.
func resolveAliasAccountID(aliasAccountID string, accounts []domain.Account) string {
	aliasAccountID = strings.TrimSpace(aliasAccountID)
	for _, account := range accounts {
		if account.ID == aliasAccountID {
			return aliasAccountID
		}
	}

	for _, account := range accounts {
		if !domain.IsDollarAccount(account.AccountType) {
			return account.ID
		}
	}

	if len(accounts) > 0 {
		return accounts[0].ID
	}

	return ""
}
