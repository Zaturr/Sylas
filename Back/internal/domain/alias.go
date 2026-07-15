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
	AccountID  string    `json:"account_id"`
	AliasValue string    `json:"alias_value"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

// AliasBankLink representa la cuenta vinculada al alias en un banco específico.
// Un alias puede tener un vínculo por banco (0172, 0134, etc.).
type AliasBankLink struct {
	ID        string    `json:"id"`
	AliasID   string    `json:"alias_id"`
	BankID    string    `json:"bank_id"`
	AccountID string    `json:"account_id"`
	CreatedAt time.Time `json:"created_at"`
}

// AliasBankLinkDetail expone el vínculo alias-banco con el estado actual de la cuenta.
type AliasBankLinkDetail struct {
	BankID    string `json:"bank_id"`
	AccountID string `json:"account_id"`
	Status    string `json:"status"`
}

// BuildAliasBankLinkDetails enriquece los vínculos con el status de cada cuenta vinculada.
func BuildAliasBankLinkDetails(links []AliasBankLink, accounts []Account) []AliasBankLinkDetail {
	statusByAccountID := make(map[string]string, len(accounts))
	for _, account := range accounts {
		statusByAccountID[account.ID] = account.Status
	}

	details := make([]AliasBankLinkDetail, 0, len(links))
	for _, link := range links {
		details = append(details, AliasBankLinkDetail{
			BankID:    link.BankID,
			AccountID: link.AccountID,
			Status:    statusByAccountID[link.AccountID],
		})
	}
	return details
}

// AllAliasLinkedAccountsInactive verifica que cada cuenta vinculada al alias (por banco) esté INAC.
// Requisito previo para BLKD global.
func AllAliasLinkedAccountsInactive(links []AliasBankLink, accounts []Account) bool {
	if len(links) == 0 {
		return false
	}

	statusByAccountID := make(map[string]string, len(accounts))
	for _, account := range accounts {
		statusByAccountID[account.ID] = account.Status
	}

	for _, link := range links {
		status, ok := statusByAccountID[link.AccountID]
		if !ok || !IsAccountInactive(status) {
			return false
		}
	}
	return true
}

type AccountDetail struct {
	Bank          string `json:"bank"`
	AccountNumber string `json:"account_number"`
	Status        string `json:"status"`
	IsLinked      bool   `json:"is_linked"` // Indicador si esta cuenta específica es la dueña del alias
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
