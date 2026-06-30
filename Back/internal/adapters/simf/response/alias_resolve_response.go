package response

import (
	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// BuildFormatErrorMessage responde RJCT + RR10 por parámetros de path inválidos.
func BuildFormatErrorMessage(query simfdomain.AliasResolveQuery) simfdomain.AliasResolveMessage {
	return simfdomain.AliasResolveMessage{
		AlisIdInqRes: simfdomain.AliasResolveResponse{
			GrpHdr: toAliasResolveGroupHeader(NewGroupHeader(query.AgentCode)),
			Report: mapper.BuildAliasResolveReport(
				query,
				mapper.AliasResolveCoreData{},
				simfdomain.ResultReject,
				simfdomain.ReasonFormat,
			),
		},
	}
}

// BuildNotFoundMessage responde RJCT + BE23 (titular o alias no registrado).
func BuildNotFoundMessage(query simfdomain.AliasResolveQuery) simfdomain.AliasResolveMessage {
	return simfdomain.AliasResolveMessage{
		AlisIdInqRes: simfdomain.AliasResolveResponse{
			GrpHdr: toAliasResolveGroupHeader(NewGroupHeader(query.AgentCode)),
			Report: mapper.BuildAliasResolveReport(
				query,
				mapper.AliasResolveCoreData{},
				simfdomain.ResultReject,
				simfdomain.ReasonNotFound,
			),
		},
	}
}

// BuildAcceptMessage responde ACCP con titular, alias y AgtList.
func BuildAcceptMessage(query simfdomain.AliasResolveQuery, coreData mapper.AliasResolveCoreData) simfdomain.AliasResolveMessage {
	return simfdomain.AliasResolveMessage{
		AlisIdInqRes: simfdomain.AliasResolveResponse{
			GrpHdr: toAliasResolveGroupHeader(NewGroupHeader(agentCodeFromResolve(query, coreData))),
			Report: mapper.BuildAliasResolveReport(
				query,
				coreData,
				simfdomain.ResultAccept,
				simfdomain.ReasonNone,
			),
		},
	}
}

func toAliasResolveGroupHeader(hdr simfdomain.GroupHeader) simfdomain.AliasResolveGroupHeader {
	return simfdomain.AliasResolveGroupHeader{
		MsgID:   hdr.MsgID,
		CreDtTm: hdr.CreDtTm,
	}
}

func agentCodeFromResolve(query simfdomain.AliasResolveQuery, coreData mapper.AliasResolveCoreData) string {
	if query.AgentCode != "" {
		return query.AgentCode
	}
	if len(coreData.Accounts) > 0 {
		return coreData.Accounts[0].BankID
	}
	return query.AgentCode
}
