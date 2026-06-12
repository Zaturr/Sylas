package domain

import "time"

type Account struct {
	ID            string    `json:"id"`
	BankID        string    `json:"bank_id"`
	CustomerID    string    `json:"customer_id"`
	AccountNumber string    `json:"account_number"`
	AccountType   string    `json:"account_type"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}
