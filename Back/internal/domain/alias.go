package domain

import (
	"strings"
	"time"
)

const (
	AliasStatusEnabled      = "ENABLED"
	AliasStatusDisabled     = "DISABLED"
	AliasStatusBlocked      = "BLKD"
	AliasStatusUnregistered = "UNRG"
)

// IsAliasGloballyBlocked indica si el alias tiene baja global (SIMF BLKD).
func IsAliasGloballyBlocked(status string) bool {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case AliasStatusDisabled, AliasStatusBlocked, "BLOCKED":
		return true
	default:
		return false
	}
}

// IsAliasActive indica si el alias está vigente (no aislado por BLKD/DISABLED).
func IsAliasActive(status string) bool {
	return !IsAliasGloballyBlocked(status)
}

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
	Status        string `json:"status"`
}

// AliasDetail agrupa la información completa de un alias para el panel de control
type AliasDetail struct {
	CustomerID     string          `json:"customer_id"`
	DocumentType   string          `json:"document_type"`
	DocumentNumber string          `json:"document_number"`
	FirstName      string          `json:"first_name"`
	MiddleName     string          `json:"middle_name"`
	LastName       string          `json:"last_name"`
	SecondLastName string          `json:"second_last_name"`
	AliasValue     string          `json:"alias"`
	AliasStatus    string          `json:"alias_status"`
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
