package domain

// AliasInquiryResult agrupa titular, cuentas y alias para consultas SIMF/HTTP.
type AliasInquiryResult struct {
	Customer      *Customer
	Accounts      []Account
	Aliases       []Alias
	IsLegalEntity bool
}
