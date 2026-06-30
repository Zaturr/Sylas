package mapper

import (
	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// BuildAntiphishingFormatReport responde RJCT + RR10 por parámetros inválidos.
func BuildAntiphishingFormatReport(query simfdomain.AntiphishingSimfQuery) simfdomain.AliasResolveReport {
	_ = query
	return simfdomain.AliasResolveReport{
		Result: simfdomain.ResultReject,
		Rsn:    simfdomain.ReasonFormat,
	}
}

// BuildAntiphishingReport arma InqRpt para GET anti-phishing por alias y banco destino.
func BuildAntiphishingReport(
	query simfdomain.AntiphishingSimfQuery,
	coreData AliasResolveCoreData,
) simfdomain.AliasResolveReport {
	if coreData.Alias == nil {
		return simfdomain.AliasResolveReport{
			Result: simfdomain.ResultReject,
			Rsn:    simfdomain.ReasonNotFound,
		}
	}

	agentStatus := AgentStatusForBank(coreData.Accounts, query.DestinationAgent)
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
