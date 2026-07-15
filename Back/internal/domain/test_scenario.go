package domain

type TestScenarioAccount struct {
	BankID string `json:"bank_id"`
	Status string `json:"status"`
	Type   string `json:"type,omitempty"`
}

type TestScenarioAlias struct {
	AliasValue   string `json:"alias_value"`
	AliasStatus  string `json:"alias_status,omitempty"`
	AccountIndex int    `json:"account_index"`
}

type TestScenario struct {
	ID                  string                `json:"id"`
	Label               string                `json:"label"`
	DocumentType        string                `json:"document_type,omitempty"`
	DocumentNumber      string                `json:"document_number"`
	AliasValue          string                `json:"alias_value,omitempty"`
	FirstName           string                `json:"first_name"`
	MiddleName          string                `json:"middle_name"`
	LastName            string                `json:"last_name"`
	SecondLastName      string                `json:"second_last_name"`
	AliasStatus         string                `json:"alias_status,omitempty"`
	LinkedAccountIndex  *int                  `json:"linked_account_index,omitempty"`
	Aliases             []TestScenarioAlias   `json:"aliases,omitempty"`
	Accounts            []TestScenarioAccount `json:"accounts"`
}

type TestScenarioSeedRequest struct {
	UserBankID  string         `json:"user_bank_id"`
	AccountType string         `json:"account_type"`
	Scenarios   []TestScenario `json:"scenarios"`
}

type TestScenarioSeedResult struct {
	Created int      `json:"created"`
	Skipped int      `json:"skipped"`
	Errors  []string `json:"errors,omitempty"`
}
