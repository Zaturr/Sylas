package sqlite

import (
	"context"
	"database/sql"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

func InitDatabase(filepath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", filepath+"?_pragma=foreign_keys(1)&_pragma=busy_timeout(30000)&_pragma=journal_mode(WAL)")
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = createTables(ctx, db)
	if err != nil {
		db.Close()
		return nil, err
	}

	err = migrateSchema(ctx, db)
	if err != nil {
		db.Close()
		return nil, err
	}

	err = seedBanks(ctx, db)
	if err != nil {
		db.Close()
		return nil, err
	}

	return db, nil

}

func seedBanks(ctx context.Context, db *sql.DB) error {
	query := `
	INSERT INTO banks (id, name) VALUES 
	('0001', 'Banco Central de Venezuela (BCV)'),
	('0102', 'Banco de Venezuela'),
	('0104', 'Banco Venezolano de Crédito'),
	('0105', 'Banco Mercantil'),
	('0108', 'Banco Provincial'),
	('0114', 'Bancaribe'),
	('0115', 'Banco Exterior'),
	('0128', 'Banco Caroní'),
	('0134', 'Banesco'),
	('0137', 'Banco Sofitasa'),
	('0138', 'Banco Plaza'),
	('0145', 'Banco de Comercio Exterior (BANCOEX)'),
	('0146', 'Bangente'),
	('0149', 'Instituto Municipal de Crédito Popular (IMCP)'),
	('0151', 'BFC Banco Fondo Común'),
	('0156', '100% Banco'),
	('0157', 'Banco del Sur (DelSur)'),
	('0163', 'Banco del Tesoro'),
	('0166', 'Banco Agrícola de Venezuela'),
	('0168', 'Bancrecer'),
	('0169', 'R4 Banco Microfinanciero'), 
	('0171', 'Banco Activo'),
	('0172', 'Bancamiga'),
	('0173', 'Banco Internacional de Desarrollo'),
	('0174', 'Banplus'),
	('0175', 'Banco Digital de los Trabajadores (Bicentenario)'),
	('0177', 'Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)'),
	('0178', 'N58 Banco Digital'),
	('0191', 'Banco Nacional de Crédito (BNC)')
	ON CONFLICT(id) DO NOTHING;
	`
	_, err := db.ExecContext(ctx, query)
	return err
}

func createTables(ctx context.Context, db *sql.DB) error {
	ddl := `
	PRAGMA journal_mode = WAL;
	PRAGMA synchronous = NORMAL;
	PRAGMA temp_store = MEMORY;
	PRAGMA foreign_keys = ON;

	CREATE TABLE IF NOT EXISTS banks (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	created_at DATATIME DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS customers(
	id TEXT PRIMARY KEY,
	document_type TEXT NOT NULL,
	document_number TEXT NOT NULL,
	first_name TEXT NOT NULL,
	middle_name TEXT,
	last_name TEXT NOT NULL,
	second_last_name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	phone TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(document_type, document_number)
	);

	CREATE TABLE IF NOT EXISTS accounts (
	id TEXT PRIMARY KEY,
	bank_id TEXT NOT NULL,
	customer_id TEXT NOT NULL,
	account_number TEXT NOT NULL UNIQUE,
	account_type TEXT NOT NULL,
	status TEXT DEFAULT 'ACTIVE',
	created_at DATATIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
	FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
	UNIQUE(customer_id, bank_id)
	);

	CREATE TABLE IF NOT EXISTS alias(
	id TEXT PRIMARY KEY,
	customer_id TEXT NOT NULL,
	alias_value TEXT NOT NULL UNIQUE,
	status TEXT NOT NULL DEFAULT 'ENABLED',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
	);
	

	CREATE INDEX IF NOT EXISTS idx_alias_value ON alias(alias_value);
	CREATE INDEX IF NOT EXISTS idx_alias_customer_id ON alias(customer_id);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_alias_one_active_per_customer
	ON alias(customer_id)
	WHERE status NOT IN ('BLKD', 'DISABLED', 'BLOCKED');
	CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name);
	CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);
	CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number);
	`
	_, err := db.ExecContext(ctx, ddl)
	return err
}

func migrateSchema(ctx context.Context, db *sql.DB) error {
	// Migración para agregar columnas middle_name y second_last_name si no existen
	_, err := db.ExecContext(ctx, `ALTER TABLE customers ADD COLUMN middle_name TEXT`)
	if err != nil && !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
		// Ignoramos si la columna ya existe
	}
	_, err = db.ExecContext(ctx, `ALTER TABLE customers ADD COLUMN second_last_name TEXT NOT NULL DEFAULT ''`)
	if err != nil && !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
		// Ignoramos si la columna ya existe
	}

	_, err = db.ExecContext(ctx, `ALTER TABLE alias ADD COLUMN status TEXT NOT NULL DEFAULT 'ENABLED'`)
	if err != nil && !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
		return err
	}

	if err := migrateCustomersCompositeDocumentKey(ctx, db); err != nil {
		return err
	}

	if err := migrateRemoveCustomersPhoneUnique(ctx, db); err != nil {
		return err
	}

	if err := migrateAliasAllowMultiplePerCustomer(ctx, db); err != nil {
		return err
	}

	return ensureAliasOneActivePerCustomerIndex(ctx, db)
}

func migrateRemoveCustomersPhoneUnique(ctx context.Context, db *sql.DB) error {
	needsMigration, err := needsCustomersPhoneUniqueRemoval(ctx, db)
	if err != nil || !needsMigration {
		return err
	}

	stmts := []string{
		"PRAGMA foreign_keys=OFF",
		"BEGIN TRANSACTION",
		`CREATE TABLE customers_phone_migration (
			id TEXT PRIMARY KEY,
			document_type TEXT NOT NULL,
			document_number TEXT NOT NULL,
			first_name TEXT NOT NULL,
			middle_name TEXT,
			last_name TEXT NOT NULL,
			second_last_name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			phone TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(document_type, document_number)
		)`,
		`INSERT INTO customers_phone_migration
			SELECT id, document_type, document_number, first_name, middle_name, last_name, second_last_name, email, phone, created_at
			FROM customers`,
		"DROP TABLE customers",
		"ALTER TABLE customers_phone_migration RENAME TO customers",
		"CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name)",
		"CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name)",
		"CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number)",
		"COMMIT",
		"PRAGMA foreign_keys=ON",
	}

	for _, stmt := range stmts {
		if _, err := db.ExecContext(ctx, stmt); err != nil {
			return err
		}
	}

	return nil
}

func needsCustomersPhoneUniqueRemoval(ctx context.Context, db *sql.DB) (bool, error) {
	var tableSQL string
	err := db.QueryRowContext(ctx, `SELECT sql FROM sqlite_master WHERE type='table' AND name='customers'`).Scan(&tableSQL)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	normalized := strings.ToUpper(tableSQL)
	return strings.Contains(normalized, "PHONE TEXT NOT NULL UNIQUE"), nil
}

func migrateCustomersCompositeDocumentKey(ctx context.Context, db *sql.DB) error {
	needsMigration, err := needsCustomersDocumentMigration(ctx, db)
	if err != nil || !needsMigration {
		return err
	}

	stmts := []string{
		"PRAGMA foreign_keys=OFF",
		"BEGIN TRANSACTION",
		`CREATE TABLE customers_migrated (
			id TEXT PRIMARY KEY,
			document_type TEXT NOT NULL,
			document_number TEXT NOT NULL,
			first_name TEXT NOT NULL,
			middle_name TEXT,
			last_name TEXT NOT NULL,
			second_last_name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			phone TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(document_type, document_number)
		)`,
		`INSERT INTO customers_migrated
			SELECT id, document_type, document_number, first_name, middle_name, last_name, second_last_name, email, phone, created_at
			FROM customers`,
		"DROP TABLE customers",
		"ALTER TABLE customers_migrated RENAME TO customers",
		"CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name)",
		"CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name)",
		"CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number)",
		"COMMIT",
		"PRAGMA foreign_keys=ON",
	}

	for _, stmt := range stmts {
		if _, err := db.ExecContext(ctx, stmt); err != nil {
			return err
		}
	}

	return nil
}

func needsCustomersDocumentMigration(ctx context.Context, db *sql.DB) (bool, error) {
	var tableSQL string
	err := db.QueryRowContext(ctx, `SELECT sql FROM sqlite_master WHERE type='table' AND name='customers'`).Scan(&tableSQL)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	normalized := strings.ToUpper(tableSQL)
	return strings.Contains(normalized, "DOCUMENT_NUMBER TEXT NOT NULL UNIQUE"), nil
}

func migrateAliasAllowMultiplePerCustomer(ctx context.Context, db *sql.DB) error {
	needsMigration, err := needsAliasCustomerUniqueRemoval(ctx, db)
	if err != nil || !needsMigration {
		return err
	}

	stmts := []string{
		"PRAGMA foreign_keys=OFF",
		"BEGIN TRANSACTION",
		`CREATE TABLE alias_migrated (
			id TEXT PRIMARY KEY,
			customer_id TEXT NOT NULL,
			alias_value TEXT NOT NULL UNIQUE,
			status TEXT NOT NULL DEFAULT 'ENABLED',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
		)`,
		`INSERT INTO alias_migrated
			SELECT id, customer_id, alias_value, status, created_at
			FROM alias`,
		"DROP TABLE alias",
		"ALTER TABLE alias_migrated RENAME TO alias",
		"CREATE INDEX IF NOT EXISTS idx_alias_value ON alias(alias_value)",
		"CREATE INDEX IF NOT EXISTS idx_alias_customer_id ON alias(customer_id)",
		"COMMIT",
		"PRAGMA foreign_keys=ON",
	}

	for _, stmt := range stmts {
		if _, err := db.ExecContext(ctx, stmt); err != nil {
			return err
		}
	}

	return nil
}

func needsAliasCustomerUniqueRemoval(ctx context.Context, db *sql.DB) (bool, error) {
	var tableSQL string
	err := db.QueryRowContext(ctx, `SELECT sql FROM sqlite_master WHERE type='table' AND name='alias'`).Scan(&tableSQL)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	normalized := strings.ToUpper(tableSQL)
	return strings.Contains(normalized, "CUSTOMER_ID TEXT NOT NULL UNIQUE"), nil
}

func ensureAliasOneActivePerCustomerIndex(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `
		CREATE UNIQUE INDEX IF NOT EXISTS idx_alias_one_active_per_customer
		ON alias(customer_id)
		WHERE status NOT IN ('BLKD', 'DISABLED', 'BLOCKED')
	`)
	return err
}
