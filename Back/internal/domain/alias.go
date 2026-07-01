package domain

import "time"

const (
	AliasStatusEnabled  = "ENABLED"
	AliasStatusDisabled = "DISABLED"
)

type Alias struct {
	ID         string    `json:"id"`
	CustomerID string    `json:"customer_id"`
	AliasValue string    `json:"alias_value"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type AccountDetail struct {
	Bank          string `json:"bank"`
	AccountNumber string `json:"account_number"`
}

// AliasDetail agrupa la información completa de un alias para el panel de control
type AliasDetail struct {
	CustomerID     string          `json:"customer_id"`
	DocumentType   string          `json:"document_type"`
	DocumentNumber string          `json:"document_number"`
	FirstName      string          `json:"first_name"`
	LastName       string          `json:"last_name"`
	AliasValue     string          `json:"alias"`
	Email          string          `json:"email"`
	Phone          string          `json:"phone"`
	Accounts       []AccountDetail `json:"accounts"`
}

type PaginationMeta struct {
	Page         int `json:"page"`
	Limit        int `json:"limit"`
	TotalRecords int `json:"total_records"`
	TotalPages   int `json:"total_pages"`
}

type PaginatedAliasResponse struct {
	Data       []AliasDetail  `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}
