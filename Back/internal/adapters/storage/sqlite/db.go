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
	('0102', 'Banco de Venezuela'),
	('0104', 'Banco Venezolano de Crédito'),
	('0105', 'Banco Mercantil'),
	('0108', 'Banco Provincial'),
	('0114', 'Bancaribe'),
	('0115', 'Banco Exterior'),
	('0128', 'Banco Caroní'),
	('0134', 'Banesco'),
	('0138', 'Banco Plaza'),
	('0151', 'BFC Banco Fondo Común'),
	('0156', '100% Banco'),
	('0157', 'Banco del Sur'),
	('0163', 'Banco del Tesoro'),
	('0166', 'Banco Agrícola de Venezuela'),
	('0168', 'Bancrecer'),
	('0169', 'Mi Banco'),
	('0171', 'Banco Activo'),
	('0172', 'Bancamiga'),
	('0174', 'Banplus'),
	('0175', 'Banco Bicentenario'),
	('0177', 'Banco de la Fuerza Armada Nacional Bolivariana'),
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
	document_number TEXT NOT NULL UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NO NULL,
	email TEXT NOT NULL UNIQUE,
	phone TEXT NOT NULL UNIQUE,
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
	customer_id TEXT NOT NULL UNIQUE,
	alias_value TEXT NOT NULL UNIQUE,
	status TEXT NOT NULL DEFAULT 'ENABLED',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
	);
	

	CREATE INDEX IF NOT EXISTS idx_alias_value ON alias(alias_value);
	CREATE INDEX IF NOT EXISTS idx_alias_customer_id ON alias(customer_id);
	CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name);
	CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);
	CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number);
	`
	_, err := db.ExecContext(ctx, ddl)
	return err
}

func migrateSchema(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `ALTER TABLE alias ADD COLUMN status TEXT NOT NULL DEFAULT 'ENABLED'`)
	if err != nil && !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
		return err
	}
	return nil
}
