package mapper

import (
	"strings"

	"Alias_bdca/Back/internal/domain"
	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// responde RJCT + RR10 por parámetros inválidos.
func BuildAntiphishingFormatReport(query simfdomain.AntiphishingSimfQuery) simfdomain.AliasResolveReport {
	_ = query
	return simfdomain.AliasResolveReport{
		Result: simfdomain.ResultReject,
		Rsn:    simfdomain.ReasonFormat,
	}
}

// arma InqRpt para GET antiphishing por alias y banco destino.
func BuildAntiphishingReport(
	query simfdomain.AntiphishingSimfQuery,
	coreData AliasResolveCoreData,
) simfdomain.AliasResolveReport {
	resolvedAlias := findAliasByValue(coreData.Aliases, query.Alias)
	if resolvedAlias == nil {
		return simfdomain.AliasResolveReport{
			Result: simfdomain.ResultReject,
			Rsn:    simfdomain.ReasonNotFound,
		}
	}

	bankLinks := coreData.BankLinksByAliasID[resolvedAlias.ID]
	agentStatus := AgentStatusForBank(resolvedAlias, bankLinks, coreData.Accounts, query.DestinationAgent)
	aliasList := []simfdomain.AliasResolveEntry{
		{
			Alias: query.Alias,
			AgtList: []simfdomain.AliasResolveAgentStatus{
				{
					Agt: query.DestinationAgent,
					Sts: agentStatus,
				},
			},
		},
	}

	report := simfdomain.AliasResolveReport{
		Result:    simfdomain.ResultAccept,
		Rsn:       simfdomain.ReasonNone,
		AliasList: aliasList,
	}

	// Pty solo cuando el vínculo en el banco destino está ACTV (anti-phishing).
	if agentStatus == simfdomain.StatusActive && coreData.Customer != nil {
		schemeName := SchemeNameFromDocumentType(coreData.Customer.DocumentType)
		titular := TitularFromCoreCustomer(coreData.Customer, schemeName)
		report.Titular = &titular
	}

	return report
}

func findAliasByValue(aliases []domain.Alias, aliasValue string) *domain.Alias {
	target := strings.TrimSpace(aliasValue)
	for i := range aliases {
		if strings.EqualFold(aliases[i].AliasValue, target) {
			return &aliases[i]
		}
	}
	return nil
}
