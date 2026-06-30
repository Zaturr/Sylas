package response

import (
	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	"Alias_bdsa/Back/internal/domain"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// BuildBlockSimfFormatErrorMessage responde IdVrfctnRpt con RJCT + RR10 (sin Mod).
func BuildBlockSimfFormatErrorMessage(cmd simfdomain.BlockSimfCommand) simfdomain.BlockSimfResponseMessage {
	return buildBlockSimfResponse(cmd, simfdomain.ResultReject, simfdomain.ReasonFormat, nil)
}

// BuildBlockSimfRejectMessage responde IdVrfctnRpt con RJCT y el Rsn indicado (sin Mod).
func BuildBlockSimfRejectMessage(cmd simfdomain.BlockSimfCommand, reasonCode string) simfdomain.BlockSimfResponseMessage {
	return buildBlockSimfResponse(cmd, simfdomain.ResultReject, reasonCode, nil)
}

// BuildBlockSimfAcceptMessage responde IdVrfctnRpt con ACCP, Mod (Alias, Agt, Sts BLKD, Pty).
func BuildBlockSimfAcceptMessage(
	cmd simfdomain.BlockSimfCommand,
	customer *domain.Customer,
) simfdomain.BlockSimfResponseMessage {
	mod := &simfdomain.BlockSimfResponseMod{
		Alias:     cmd.Alias,
		AgentCode: cmd.AgentCode,
		Status:    simfdomain.StatusBlocked,
		Titular:   mapper.TitularFromCustomer(customer),
	}
	return buildBlockSimfResponse(cmd, simfdomain.ResultAccept, simfdomain.ReasonNone, mod)
}

func buildBlockSimfResponse(
	cmd simfdomain.BlockSimfCommand,
	resultCode, reasonCode string,
	mod *simfdomain.BlockSimfResponseMod,
) simfdomain.BlockSimfResponseMessage {
	return simfdomain.BlockSimfResponseMessage{
		IdVrfctnRpt: simfdomain.BlockSimfResponse{
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
