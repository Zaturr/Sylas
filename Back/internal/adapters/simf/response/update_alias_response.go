package response

import (
	"Alias_bdca/Back/internal/adapters/simf/mapper"
	"Alias_bdca/Back/internal/domain"
	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// BuildUpdateAliasFormatErrorMessage responde IdVrfctnRpt con RJCT + RR10 (sin Mod).
func BuildUpdateAliasFormatErrorMessage(cmd simfdomain.UpdateAliasCommand) simfdomain.UpdateAliasSimfResponseMessage {
	return buildUpdateAliasResponse(cmd, simfdomain.ResultReject, simfdomain.ReasonFormat, nil)
}

// BuildUpdateAliasRejectMessage responde IdVrfctnRpt con RJCT y el Rsn indicado (sin Mod).
func BuildUpdateAliasRejectMessage(cmd simfdomain.UpdateAliasCommand, reasonCode string) simfdomain.UpdateAliasSimfResponseMessage {
	return buildUpdateAliasResponse(cmd, simfdomain.ResultReject, reasonCode, nil)
}

// BuildUpdateAliasAcceptMessage responde IdVrfctnRpt con ACCP, Mod (Alias, Agt, Sts, Pty).
func BuildUpdateAliasAcceptMessage(
	cmd simfdomain.UpdateAliasCommand,
	customer *domain.Customer,
) simfdomain.UpdateAliasSimfResponseMessage {
	mod := &simfdomain.UpdateAliasSimfResponseMod{
		Alias:     cmd.Alias,
		AgentCode: cmd.AgentCode,
		Status:    cmd.Status,
		Titular:   mapper.TitularFromCustomer(customer),
	}
	return buildUpdateAliasResponse(cmd, simfdomain.ResultAccept, simfdomain.ReasonNone, mod)
}

func buildUpdateAliasResponse(
	cmd simfdomain.UpdateAliasCommand,
	resultCode, reasonCode string,
	mod *simfdomain.UpdateAliasSimfResponseMod,
) simfdomain.UpdateAliasSimfResponseMessage {
	return simfdomain.UpdateAliasSimfResponseMessage{
		IdVrfctnRpt: simfdomain.UpdateAliasSimfResponse{
			GrpHdr: NewGroupHeader(cmd.AgentCode),
			OrgnlAssgnmt: simfdomain.CreateUserSimfOrgnlAssgnmt{
				OrgnlMsgID:   cmd.MsgID,
				OrgnlCreDtTm: cmd.CreDtTm,
			},
			Report: simfdomain.CreateUserSimfReport{
				OrgnlEndToEndID: cmd.EndToEndID,
				Result:          resultCode,
				Rsn:             reasonCode,
			},
			Mod: mod,
		},
	}
}
