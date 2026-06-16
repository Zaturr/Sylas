package simulation

import (
	"context"
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	"github.com/go-faker/faker/v4"
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

// RunDataRandomizer ejecuta la inyección masiva utilizando faker para identidades coherentes.
func RunDataRandomizer(ctx context.Context, db *sql.DB, config RandomizerConfig) error {
	rand.Seed(time.Now().UnixNano())

	// 1. Registrar o verificar los bancos enviados en el JSON
	for _, b := range config.Banks {
		_, err := db.ExecContext(ctx, "INSERT OR IGNORE INTO banks (id, name) VALUES (?, ?)", b.ID, b.Name)
		if err != nil {
			return fmt.Errorf("error al registrar banco base %s: %w", b.ID, err)
		}
	}

	// 2. Cargar datos existentes desde la base de datos a los mapas en memoria ANTES de abrir la transacción
	aliasExistentes := make(map[string]bool)
	documentosExistentes := make(map[string]bool)
	telefonosExistentes := make(map[string]bool)
	emailsExistentes := make(map[string]bool)

	// Cargar clientes existentes (documentos, emails, teléfonos)
	rowsCust, err := db.QueryContext(ctx, "SELECT document_number, email, phone FROM customers")
	if err == nil {
		for rowsCust.Next() {
			var doc, email, phone string
			if err := rowsCust.Scan(&doc, &email, &phone); err == nil {
				documentosExistentes[doc] = true
				emailsExistentes[email] = true
				telefonosExistentes[phone] = true
			}
		}
		rowsCust.Close() // Cierre explícito inmediato
	}

	// Cargar alias existentes
	rowsAlias, err := db.QueryContext(ctx, "SELECT alias_value FROM alias")
	if err == nil {
		for rowsAlias.Next() {
			var alias string
			if err := rowsAlias.Scan(&alias); err == nil {
				aliasExistentes[alias] = true
			}
		}
		rowsAlias.Close() // Cierre explícito inmediato
	}

	// 3. Iniciar transacción única para optimizar la inserción masiva en SQLite
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("error al abrir transacción de simulación: %w", err)
	}

	// 4. Bucle de generación aleatoria masiva (Secuencial)
	for i := 1; i <= config.TotalCustomers; i++ {
		customerID := uuid.New().String()

		// Generar y validar Cédula
		var docNumber string
		for {
			docNumber = fmt.Sprintf("%d", rand.Intn(34000000)+1000000)
			if !documentosExistentes[docNumber] {
				documentosExistentes[docNumber] = true
				break
			}
		}

		// Generar datos base
		firstName := faker.FirstName()
		lastName := faker.LastName()
		fName := lowerString(firstName)
		lName := lowerString(lastName)

		// Generar y validar Email
		var email string
		for {
			email = fmt.Sprintf("%s.%s%d@gmail.com", fName, lName, rand.Intn(999)+1)
			if !emailsExistentes[email] {
				emailsExistentes[email] = true
				break
			}
		}

		// Generar y validar Teléfono
		prefijos := []string{"0414", "0424", "0412", "0416", "0426"}
		var phone string
		for {
			prefijo := prefijos[rand.Intn(len(prefijos))]
			phone = fmt.Sprintf("%s%07d", prefijo, rand.Intn(10000000))
			if !telefonosExistentes[phone] {
				telefonosExistentes[phone] = true
				break
			}
		}

		// Insertar Cliente
		_, err = tx.ExecContext(ctx,
			"INSERT INTO customers (id, document_type, document_number, first_name, last_name, email, phone) VALUES (?, 'V', ?, ?, ?, ?, ?)",
			customerID, docNumber, firstName, lastName, email, phone)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error al insertar cliente: %w", err)
		}

		// Generar Cuentas e insertarlas
		numAccounts := rand.Intn(config.MaxAccountsPerCustomer) + 1
		for a := 1; a <= numAccounts; a++ {
			accountID := uuid.New().String()
			bancoAsignado := config.Banks[rand.Intn(len(config.Banks))].ID
			accountNumber := fmt.Sprintf("%s%016d", bancoAsignado, rand.Int63n(9999999999999999))

			_, err = tx.ExecContext(ctx,
				"INSERT INTO accounts (id, bank_id, customer_id, account_number, account_type) VALUES (?, ?, ?, ?, 'SAVINGS')",
				accountID, bancoAsignado, customerID, accountNumber)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("error al insertar cuenta: %w", err)
			}
		}

		// Generar y validar Alias
		aliasID := uuid.New().String()
		var aliasPatterns []string
		if len(fName) > 0 && len(lName) > 0 {
			aliasPatterns = []string{
				fmt.Sprintf("%s.%s", fName, lName),
				fmt.Sprintf("%s%s", string(fName[0]), lName),
				fmt.Sprintf("%s%s", fName, string(lName[0])),
				fmt.Sprintf("%s%s", fName, lName),
				fmt.Sprintf("%s_%s", fName, lName),
			}
		} else {
			aliasPatterns = []string{fmt.Sprintf("user.%d", rand.Intn(90000)+10000)}
		}

		var aliasValue string
		aliasEncontrado := false

		for _, pattern := range aliasPatterns {
			if !aliasExistentes[pattern] {
				aliasValue = pattern
				aliasExistentes[aliasValue] = true
				aliasEncontrado = true
				break
			}
		}

		if !aliasEncontrado {
			basePattern := aliasPatterns[0]
			for {
				aliasValue = fmt.Sprintf("%s%d", basePattern, rand.Intn(90000)+10000)
				if !aliasExistentes[aliasValue] {
					aliasExistentes[aliasValue] = true
					break
				}
			}
		}

		// Insertar Alias
		_, err = tx.ExecContext(ctx, "INSERT INTO alias (id, customer_id, alias_value) VALUES (?, ?, ?)",
			aliasID, customerID, aliasValue)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error al insertar alias: %w", err)
		}
	}

	// Al final, hacer el Commit
	return tx.Commit()
}

func lowerString(s string) string {
	runes := []rune(s)
	for i, r := range runes {
		if r >= 'A' && r <= 'Z' {
			runes[i] = r + 32
		}
	}
	return string(runes)
}
