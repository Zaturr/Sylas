package response

import (
	"Alias_bdca/Back/internal/adapters/simf/mapper"
	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// BuildAntiphishingFormatErrorMessage responde RJCT + RR10 por path inválido.
func BuildAntiphishingFormatErrorMessage(query simfdomain.AntiphishingSimfQuery) simfdomain.AliasResolveMessage {
	return buildAntiphishingMessage(
		query,
		mapper.BuildAntiphishingFormatReport(query),
	)
}

// BuildAntiphishingMessage arma AlisIdInqRes a partir del reporte ya construido.
func BuildAntiphishingMessage(
	query simfdomain.AntiphishingSimfQuery,
	report simfdomain.AliasResolveReport,
) simfdomain.AliasResolveMessage {
	return buildAntiphishingMessage(query, report)
}

func buildAntiphishingMessage(
	query simfdomain.AntiphishingSimfQuery,
	report simfdomain.AliasResolveReport,
) simfdomain.AliasResolveMessage {
	return simfdomain.AliasResolveMessage{
		AlisIdInqRes: simfdomain.AliasResolveResponse{
			GrpHdr: toAliasResolveGroupHeader(NewGroupHeader(query.DestinationAgent)),
			Report: report,
		},
	}
}
