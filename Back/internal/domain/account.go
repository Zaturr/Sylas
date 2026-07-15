package domain

import (
	"strings"
	"time"
)

type Account struct {
	ID            string    `json:"id"`
	BankID        string    `json:"bank_id"`
	CustomerID    string    `json:"customer_id"`
	AccountNumber string    `json:"account_number"`
	AccountType   string    `json:"account_type"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// IsAccountInactive indica si el vínculo cuenta-banco está inactivo (INAC).
func IsAccountInactive(status string) bool {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case "INAC", "INACTIVE":
		return true
	default:
		return false
	}
}

// IsDollarAccount indica si la cuenta es en moneda extranjera (no elegible para alias).
func IsDollarAccount(accountType string) bool {
	return strings.ToLower(strings.TrimSpace(accountType)) == "dolares"
}
