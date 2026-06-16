package sqlite

import (
	"context"
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

func InitDatabase(filepath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", filepath)
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
	return db, nil

}

func createTables(ctx context.Context, db *sql.DB) error {
	ddl := `
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
	FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS alias(
	id TEXT PRIMARY KEY,
	customer_id TEXT NOT NULL UNIQUE,
	alias_value TEXT NOT NULL UNIQUE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
	);
	

	CREATE INDEX IF NOT EXISTS idx_alias_value ON alias(alias_value);
	`
	_, err := db.ExecContext(ctx, ddl)
	return err
}
