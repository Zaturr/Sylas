package mapper

import (
	"fmt"
	"strings"

	"Alias_bdca/Back/internal/domain"
	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// AliasResolveCoreData agrupa lo que devuelve la BD del core: titular, alias, cuentas y vínculos por banco.
type AliasResolveCoreData struct {
	Customer  *domain.Customer
	Alias     *domain.Alias
	Accounts  []domain.Account
	BankLinks []domain.AliasBankLink
}

// HasRegisteredAlias indica si el titular tiene un alias en el sistema.
func (data AliasResolveCoreData) HasRegisteredAlias() bool {
	return data.Alias != nil
}

// QueryToCustomerDocument convierte SchmeNm + Id del path en document_type y
// document_number para buscar en la tabla customers.
func QueryToCustomerDocument(query simfdomain.AliasResolveQuery) (documentType, documentNumber string, err error) {
	return SplitDocumentIDIntoCustomerFields(query.SchemeName, query.DocumentID)
}

// SplitDocumentIDIntoCustomerFields separa Id SIMF (ej. V12345678) en tipo y número de documento del core.
func SplitDocumentIDIntoCustomerFields(schemeName, documentID string) (documentType, documentNumber string, err error) {
	documentID = strings.TrimSpace(documentID)
	if documentID == "" {
		return "", "", fmt.Errorf("identificacion vacia")
	}

	documentType = strings.ToUpper(string(documentID[0]))
	documentNumber = documentID[1:]

	switch schemeName {
	case simfdomain.SchemeSCID, simfdomain.SchemeSRIF, simfdomain.SchemeSPAS:
		return documentType, documentNumber, nil
	default:
		return "", "", fmt.Errorf("esquema no soportado")
	}
}

// DocumentIDFromCustomer arma Id SIMF (ej. V12345678) desde el cliente del core.
func DocumentIDFromCustomer(customer *domain.Customer) string {
	if customer == nil {
		return ""
	}
	return customer.DocumentType + customer.DocumentNumber
}

// TitularFromAliasResolveQuery arma Pty solo con datos del path (respuestas de rechazo).
func TitularFromAliasResolveQuery(query simfdomain.AliasResolveQuery) simfdomain.AliasResolveTitular {
	return simfdomain.AliasResolveTitular{
		DocumentID: query.DocumentID,
		SchmeNm:    query.SchemeName,
	}
}

// TitularFromCoreCustomer arma Pty completo para respuestas exitosas (incluye Nm).
func TitularFromCoreCustomer(customer *domain.Customer, schemeName string) simfdomain.AliasResolveTitular {
	return simfdomain.AliasResolveTitular{
		Nm:         CustomerFullNameUppercase(customer),
		DocumentID: DocumentIDFromCustomer(customer),
		SchmeNm:    schemeName,
	}
}

// CustomerFullNameUppercase concatena nombre y apellido en mayúsculas (campo Nm SIMF).
func CustomerFullNameUppercase(customer *domain.Customer) string {
	if customer == nil {
		return ""
	}
	
	parts := []string{customer.FirstName}
	if strings.TrimSpace(customer.MiddleName) != "" {
		parts = append(parts, customer.MiddleName)
	}
	parts = append(parts, customer.LastName)
	if strings.TrimSpace(customer.SecondLastName) != "" {
		parts = append(parts, customer.SecondLastName)
	}
	
	return strings.ToUpper(strings.Join(parts, " "))
}

// AccountStatusToSIMF traduce el status de accounts (core) al Sts del protocolo SIMF.
func AccountStatusToSIMF(accountStatus string) string {
	switch strings.ToUpper(strings.TrimSpace(accountStatus)) {
	case "ACTIVE", simfdomain.StatusActive:
		return simfdomain.StatusActive
	case "INACTIVE", simfdomain.StatusInactive:
		return simfdomain.StatusInactive
	case simfdomain.StatusPendingDrop:
		return simfdomain.StatusPendingDrop
	case "BLOCKED", simfdomain.StatusBlocked:
		return simfdomain.StatusBlocked
	case simfdomain.StatusUnregistered:
		return simfdomain.StatusUnregistered
	default:
		return simfdomain.StatusActive
	}
}

// AgentStatusForBank devuelve Sts del banco indicado o UNRG si no hay cuenta vinculada.
// Si el alias está bloqueado globalmente, devuelve BLKD sin importar el status de la cuenta.
func AgentStatusForBank(
	alias *domain.Alias,
	bankLinks []domain.AliasBankLink,
	accounts []domain.Account,
	bankID string,
) string {
	if alias != nil && domain.IsAliasGloballyBlocked(alias.Status) {
		return simfdomain.StatusBlocked
	}

	for _, link := range bankLinks {
		if link.BankID != bankID {
			continue
		}
		for _, account := range accounts {
			if account.ID == link.AccountID {
				return AccountStatusToSIMF(account.Status)
			}
		}
		return simfdomain.StatusUnregistered
	}

	// Fallback legacy por si no hay filas en alias_bank_links
	if alias != nil && alias.AccountID != "" {
		for _, account := range accounts {
			if account.ID == alias.AccountID && account.BankID == bankID {
				return AccountStatusToSIMF(account.Status)
			}
		}
	}

	return simfdomain.StatusUnregistered
}

// BuildAgentStatusList arma AgtList según la consulta (todos los bancos vinculados o uno solo).
func BuildAgentStatusList(
	query simfdomain.AliasResolveQuery,
	alias *domain.Alias,
	accounts []domain.Account,
	bankLinks []domain.AliasBankLink,
) []simfdomain.AliasResolveAgentStatus {
	if alias != nil && domain.IsAliasGloballyBlocked(alias.Status) {
		if query.HasAgent() {
			return []simfdomain.AliasResolveAgentStatus{
				{
					Agt: query.AgentCode,
					Sts: simfdomain.StatusBlocked,
				},
			}
		}

		if len(bankLinks) == 0 {
			return nil
		}

		agentStatusList := make([]simfdomain.AliasResolveAgentStatus, 0, len(bankLinks))
		for _, link := range bankLinks {
			agentStatusList = append(agentStatusList, simfdomain.AliasResolveAgentStatus{
				Agt: link.BankID,
				Sts: simfdomain.StatusBlocked,
			})
		}
		return agentStatusList
	}

	if query.HasAgent() {
		return []simfdomain.AliasResolveAgentStatus{
			{
				Agt: query.AgentCode,
				Sts: AgentStatusForBank(alias, bankLinks, accounts, query.AgentCode),
			},
		}
	}

	if len(bankLinks) == 0 {
		return nil
	}

	agentStatusList := make([]simfdomain.AliasResolveAgentStatus, 0, len(bankLinks))
	for _, link := range bankLinks {
		sts := AgentStatusForBank(alias, bankLinks, accounts, link.BankID)
		agentStatusList = append(agentStatusList, simfdomain.AliasResolveAgentStatus{
			Agt: link.BankID,
			Sts: sts,
		})
	}
	return agentStatusList
}

// BuildAliasEntryList arma AliasList cuando el titular tiene alias registrado.
func BuildAliasEntryList(
	query simfdomain.AliasResolveQuery,
	alias *domain.Alias,
	accounts []domain.Account,
	bankLinks []domain.AliasBankLink,
) []simfdomain.AliasResolveEntry {
	if alias == nil {
		return nil
	}

	return []simfdomain.AliasResolveEntry{
		{
			Alias:   alias.AliasValue,
			AgtList: BuildAgentStatusList(query, alias, accounts, bankLinks),
		},
	}
}

// arma el cuerpo del mensaje (JSON: InqRpt) a partir del core y el query.
func BuildAliasResolveReport(
	query simfdomain.AliasResolveQuery,
	coreData AliasResolveCoreData,
	resultCode, reasonCode string,
) simfdomain.AliasResolveReport {
	report := simfdomain.AliasResolveReport{
		Result: resultCode,
		Rsn:    reasonCode,
	}

	if coreData.Customer != nil && resultCode == simfdomain.ResultAccept {
		titular := TitularFromCoreCustomer(coreData.Customer, query.SchemeName)
		report.Titular = &titular
		report.AliasList = BuildAliasEntryList(query, coreData.Alias, coreData.Accounts, coreData.BankLinks)
	} else {
		titular := TitularFromAliasResolveQuery(query)
		report.Titular = &titular
	}

	return report
}
