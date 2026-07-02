package sqlite

import (
	"Alias_bdca/Back/internal/adapters/simulation"
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/ports"
	"context"
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
)

type sqliteBulkTx struct {
	tx  *sql.Tx
	rng *rand.Rand
}

// SeedBanks inserta bancos configurados por el randomizer si aún no existen.
func (r *RealRepository) SeedBanks(ctx context.Context, banks []domain.BankSeed) error {
	for _, bank := range banks {
		_, err := r.db.ExecContext(ctx, "INSERT OR IGNORE INTO banks (id, name) VALUES (?, ?)", bank.ID, bank.Name)
		if err != nil {
			return fmt.Errorf("error al registrar banco base %s: %w", bank.ID, err)
		}
	}
	return nil
}

// BeginBulkTransaction abre una transacción para inserciones masivas por bloques.
func (r *RealRepository) BeginBulkTransaction(ctx context.Context) (ports.BulkTransaction, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("error al abrir transaccion: %w", err)
	}

	return &sqliteBulkTx{
		tx:  tx,
		rng: rand.New(rand.NewSource(rand.Int63())),
	}, nil
}

func (t *sqliteBulkTx) ResolveBatchCollisions(ctx context.Context, batch *[]domain.GeneratedCustomer) error {
	const maxRetries = 15

	for retries := 0; retries <= maxRetries; retries++ {
		if retries == maxRetries {
			return fmt.Errorf("se alcanzo el limite maximo de reintentos (%d) resolviendo colisiones", maxRetries)
		}

		docs, emails, phones, aliases, accNums := collectBatchValues(*batch)

		collidedDocs, err := t.checkCollisions(ctx, "document_number", "customers", docs)
		if err != nil {
			return err
		}
		collidedEmails, err := t.checkCollisions(ctx, "email", "customers", emails)
		if err != nil {
			return err
		}
		collidedPhones, err := t.checkCollisions(ctx, "phone", "customers", phones)
		if err != nil {
			return err
		}
		collidedAliases, err := t.checkCollisions(ctx, "alias_value", "alias", aliases)
		if err != nil {
			return err
		}
		collidedAccs, err := t.checkCollisions(ctx, "account_number", "accounts", accNums)
		if err != nil {
			return err
		}

		hasCollisions := simulation.ApplyCollisionFixes(
			batch,
			collidedDocs,
			collidedEmails,
			collidedPhones,
			collidedAliases,
			collidedAccs,
			t.rng,
		)
		if !hasCollisions {
			return nil
		}
	}

	return nil
}

func (t *sqliteBulkTx) InsertBatch(ctx context.Context, batch []domain.GeneratedCustomer) error {
	var custArgs, accArgs, aliasArgs []interface{}
	var custQuery, accQuery, aliasQuery strings.Builder

	for _, customer := range batch {
		custQuery.WriteString("(?, 'V', ?, ?, ?, ?, ?),")
		custArgs = append(custArgs, customer.ID, customer.DocNumber, customer.FirstName, customer.LastName, customer.Email, customer.Phone)

		for _, acc := range customer.Accounts {
			accQuery.WriteString("(?, ?, ?, ?, 'SAVINGS'),")
			accArgs = append(accArgs, acc.ID, acc.BankID, customer.ID, acc.AccountNumber)
		}

		aliasQuery.WriteString("(?, ?, ?),")
		aliasArgs = append(aliasArgs, customer.AliasID, customer.ID, customer.AliasValue)
	}

	if err := executeBatch(ctx, t.tx, "INSERT INTO customers (id, document_type, document_number, first_name, last_name, email, phone) VALUES ", custQuery.String(), custArgs); err != nil {
		return fmt.Errorf("error bulk insert customers: %w", err)
	}

	if len(accArgs) > 0 {
		if err := executeBatch(ctx, t.tx, "INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type) VALUES ", accQuery.String(), accArgs); err != nil {
			return fmt.Errorf("error bulk insert accounts: %w", err)
		}
	}

	if err := executeBatch(ctx, t.tx, "INSERT INTO alias (id, customer_id, alias_value) VALUES ", aliasQuery.String(), aliasArgs); err != nil {
		return fmt.Errorf("error bulk insert alias: %w", err)
	}

	return nil
}

func (t *sqliteBulkTx) Commit() error {
	return t.tx.Commit()
}

func (t *sqliteBulkTx) Rollback() error {
	return t.tx.Rollback()
}

func collectBatchValues(batch []domain.GeneratedCustomer) (docs, emails, phones, aliases, accNums []interface{}) {
	for _, customer := range batch {
		docs = append(docs, customer.DocNumber)
		emails = append(emails, customer.Email)
		phones = append(phones, customer.Phone)
		aliases = append(aliases, customer.AliasValue)
		for _, account := range customer.Accounts {
			accNums = append(accNums, account.AccountNumber)
		}
	}
	return docs, emails, phones, aliases, accNums
}

func (t *sqliteBulkTx) checkCollisions(ctx context.Context, column, table string, args []interface{}) (map[string]bool, error) {
	collided := make(map[string]bool)
	if len(args) == 0 {
		return collided, nil
	}

	placeholders := make([]string, len(args))
	for i := range placeholders {
		placeholders[i] = "?"
	}

	query := fmt.Sprintf("SELECT %s FROM %s WHERE %s IN (%s)", column, table, column, strings.Join(placeholders, ","))
	rows, err := t.tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var val string
		if err := rows.Scan(&val); err == nil {
			collided[val] = true
		}
	}

	return collided, nil
}

func executeBatch(ctx context.Context, tx *sql.Tx, baseQuery, valuesQuery string, args []interface{}) error {
	if len(args) == 0 {
		return nil
	}
	finalQuery := baseQuery + valuesQuery[:len(valuesQuery)-1]
	_, err := tx.ExecContext(ctx, finalQuery, args...)
	return err
}
