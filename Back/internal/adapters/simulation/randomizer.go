package simulation

import (
	"context"
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/google/uuid"
)

// RandomizerConfig recibe los parámetros estructurados directamente desde la API HTTP.
type RandomizerConfig struct {
	TotalCustomers         int          `json:"total_customers"`
	MaxAccountsPerCustomer int          `json:"max_accounts_per_customer"`
	Banks                  []BankParams `json:"banks"`
}

// BankParams define la estructura de los bancos que el usuario configure desde la API.
type BankParams struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GeneratedCustomer struct {
	ID         string
	DocNumber  string
	FirstName  string
	LastName   string
	Email      string
	Phone      string
	AliasID    string
	AliasValue string
	Accounts   []GeneratedAccount
}

type GeneratedAccount struct {
	ID            string
	BankID        string
	AccountNumber string
}

// RunDataRandomizer ejecuta la inyección masiva optimizada por bloques.
func RunDataRandomizer(ctx context.Context, db *sql.DB, config RandomizerConfig) error {
	rand.Seed(time.Now().UnixNano())

	// 1. Registrar bancos
	for _, b := range config.Banks {
		_, err := db.ExecContext(ctx, "INSERT OR IGNORE INTO banks (id, name) VALUES (?, ?)", b.ID, b.Name)
		if err != nil {
			return fmt.Errorf("error al registrar banco base %s: %w", b.ID, err)
		}
	}

	// 2. Iniciar Transacción
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("error al abrir transacción: %w", err)
	}

	// 3. Preparar variables para Inserción en Bloques
	batchSize := 500
	var batch []GeneratedCustomer
	prefijos := []string{"0414", "0424", "0412", "0416", "0426"}

	// 4. Bucle Principal de Generación
	for i := 1; i <= config.TotalCustomers; i++ {
		// Generar dos nombres y dos apellidos para máxima entropía usando el nuevo archivo randname.go
		nameData := generateRandomName()

		cust := GeneratedCustomer{
			ID:         uuid.New().String(),
			DocNumber:  fmt.Sprintf("%d", rand.Intn(34000000)+1000000),
			FirstName:  nameData.FullName,
			LastName:   nameData.FullLastName,
			Email:      fmt.Sprintf("%s.%s%d@gmail.com", nameData.BaseFirstName, nameData.BaseLastName, rand.Intn(99999)+1),
			Phone:      fmt.Sprintf("%s%07d", prefijos[rand.Intn(len(prefijos))], rand.Intn(10000000)),
			AliasID:    uuid.New().String(),
			AliasValue: fmt.Sprintf("%s.%s%d", nameData.BaseFirstName, nameData.BaseLastName, rand.Intn(900000)+100000),
		}

		// Generar Cuentas (Garantizando que no se repitan bancos para el mismo cliente)
		maxPossibleAccounts := len(config.Banks)
		if config.MaxAccountsPerCustomer < maxPossibleAccounts {
			maxPossibleAccounts = config.MaxAccountsPerCustomer
		}
		
		numAccounts := rand.Intn(maxPossibleAccounts) + 1

		// Crear una copia de los bancos disponibles y "barajarlos"
		availableBanks := make([]BankParams, len(config.Banks))
		copy(availableBanks, config.Banks)
		rand.Shuffle(len(availableBanks), func(i, j int) {
			availableBanks[i], availableBanks[j] = availableBanks[j], availableBanks[i]
		})

		for a := 0; a < numAccounts; a++ {
			bancoAsignado := availableBanks[a].ID
			cust.Accounts = append(cust.Accounts, GeneratedAccount{
				ID:            uuid.New().String(),
				BankID:        bancoAsignado,
				AccountNumber: fmt.Sprintf("%s%016d", bancoAsignado, rand.Int63n(9999999999999999)),
			})
		}

		batch = append(batch, cust)

		// 5. Procesar el Bloque si alcanzamos el límite o es el último registro
		if len(batch) == batchSize || i == config.TotalCustomers {

			// A. Resolver colisiones contra la BD (Solo busca los 500 registros actuales)
			// Pasamos la transacción 'tx' en lugar de 'db' para evitar deadlocks
			err := resolveBatchCollisions(ctx, tx, &batch)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("error resolviendo colisiones: %w", err)
			}

			// B. Construir las consultas Bulk Insert
			var custArgs, accArgs, aliasArgs []interface{}
			var custQuery, accQuery, aliasQuery strings.Builder

			for _, c := range batch {
				custQuery.WriteString("(?, 'V', ?, ?, ?, ?, ?),")
				custArgs = append(custArgs, c.ID, c.DocNumber, c.FirstName, c.LastName, c.Email, c.Phone)

				for _, acc := range c.Accounts {
					accQuery.WriteString("(?, ?, ?, ?, 'SAVINGS'),")
					accArgs = append(accArgs, acc.ID, acc.BankID, c.ID, acc.AccountNumber)
				}

				aliasQuery.WriteString("(?, ?, ?),")
				aliasArgs = append(aliasArgs, c.AliasID, c.ID, c.AliasValue)
			}

			// C. Ejecutar Bulk Insert
			err = executeBatch(ctx, tx, "INSERT INTO customers (id, document_type, document_number, first_name, last_name, email, phone) VALUES ", custQuery.String(), custArgs)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("error bulk insert customers: %w", err)
			}

			if len(accArgs) > 0 {
				err = executeBatch(ctx, tx, "INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type) VALUES ", accQuery.String(), accArgs)
				if err != nil {
					tx.Rollback()
					return fmt.Errorf("error bulk insert accounts: %w", err)
				}
			}

			err = executeBatch(ctx, tx, "INSERT INTO alias (id, customer_id, alias_value) VALUES ", aliasQuery.String(), aliasArgs)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("error bulk insert alias: %w", err)
			}

			// Limpiar el bloque
			batch = nil
		}
	}

	// 6. Commit Final
	return tx.Commit()
}

// resolveBatchCollisions verifica si los datos generados ya existen en la BD o dentro del mismo bloque y los regenera.
func resolveBatchCollisions(ctx context.Context, tx *sql.Tx, batch *[]GeneratedCustomer) error {
	prefijos := []string{"0414", "0424", "0412", "0416", "0426"}
	maxRetries := 15 // Salvaguarda para evitar bucles infinitos
	retries := 0

	for {
		if retries > maxRetries {
			return fmt.Errorf("se alcanzó el límite máximo de reintentos (%d) resolviendo colisiones. La base de datos podría estar muy llena para los rangos actuales", maxRetries)
		}
		
		hasCollisions := false
		retries++

		var docs, emails, phones, aliases, accNums []interface{}
		for _, c := range *batch {
			docs = append(docs, c.DocNumber)
			emails = append(emails, c.Email)
			phones = append(phones, c.Phone)
			aliases = append(aliases, c.AliasValue)
			for _, a := range c.Accounts {
				accNums = append(accNums, a.AccountNumber)
			}
		}

		// Función auxiliar para consultar colisiones en la BD usando la transacción
		checkCollisions := func(column, table string, args []interface{}) (map[string]bool, error) {
			collided := make(map[string]bool)
			if len(args) == 0 {
				return collided, nil
			}

			placeholders := make([]string, len(args))
			for i := range placeholders {
				placeholders[i] = "?"
			}

			query := fmt.Sprintf("SELECT %s FROM %s WHERE %s IN (%s)", column, table, column, strings.Join(placeholders, ","))
			rows, err := tx.QueryContext(ctx, query, args...)
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

		collidedDocs, err := checkCollisions("document_number", "customers", docs)
		if err != nil {
			return err
		}
		collidedEmails, err := checkCollisions("email", "customers", emails)
		if err != nil {
			return err
		}
		collidedPhones, err := checkCollisions("phone", "customers", phones)
		if err != nil {
			return err
		}
		collidedAliases, err := checkCollisions("alias_value", "alias", aliases)
		if err != nil {
			return err
		}
		collidedAccs, err := checkCollisions("account_number", "accounts", accNums)
		if err != nil {
			return err
		}

		// Mapas para verificar colisiones dentro del mismo bloque (Intra-batch)
		localDocs := make(map[string]bool)
		localEmails := make(map[string]bool)
		localPhones := make(map[string]bool)
		localAliases := make(map[string]bool)
		localAccs := make(map[string]bool)

		for i := range *batch {
			c := &(*batch)[i]

			if collidedDocs[c.DocNumber] || localDocs[c.DocNumber] {
				c.DocNumber = fmt.Sprintf("%d", rand.Intn(34000000)+1000000)
				hasCollisions = true
			}
			localDocs[c.DocNumber] = true

			if collidedEmails[c.Email] || localEmails[c.Email] {
				fName := lowerString(strings.Split(c.FirstName, " ")[0])
				lName := lowerString(strings.Split(c.LastName, " ")[0])
				c.Email = fmt.Sprintf("%s.%s%d@gmail.com", fName, lName, rand.Intn(999999)+1)
				hasCollisions = true
			}
			localEmails[c.Email] = true

			if collidedPhones[c.Phone] || localPhones[c.Phone] {
				c.Phone = fmt.Sprintf("%s%07d", prefijos[rand.Intn(len(prefijos))], rand.Intn(10000000))
				hasCollisions = true
			}
			localPhones[c.Phone] = true

			if collidedAliases[c.AliasValue] || localAliases[c.AliasValue] {
				fName := lowerString(strings.Split(c.FirstName, " ")[0])
				lName := lowerString(strings.Split(c.LastName, " ")[0])
				c.AliasValue = fmt.Sprintf("%s.%s%d", fName, lName, rand.Intn(9000000)+1000000)
				hasCollisions = true
			}
			localAliases[c.AliasValue] = true

			for j := range c.Accounts {
				acc := &c.Accounts[j]
				if collidedAccs[acc.AccountNumber] || localAccs[acc.AccountNumber] {
					acc.AccountNumber = fmt.Sprintf("%s%016d", acc.BankID, rand.Int63n(9999999999999999))
					hasCollisions = true
				}
				localAccs[acc.AccountNumber] = true
			}
		}

		if !hasCollisions {
			break
		}
	}
	return nil
}

// executeBatch es un helper para ejecutar la consulta SQL removiendo la última coma
func executeBatch(ctx context.Context, tx *sql.Tx, baseQuery string, valuesQuery string, args []interface{}) error {
	if len(args) == 0 {
		return nil
	}
	finalQuery := baseQuery + valuesQuery[:len(valuesQuery)-1]
	_, err := tx.ExecContext(ctx, finalQuery, args...)
	return err
}
