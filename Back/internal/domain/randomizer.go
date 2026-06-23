package domain

type RandomizerConfig struct {
	TotalCustomers         int        `json:"total_customers"`
	MaxAccountsPerCustomer int        `json:"max_accounts_per_customer"`
	Banks                  []BankSeed `json:"banks"`
}

type BankSeed struct {
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
