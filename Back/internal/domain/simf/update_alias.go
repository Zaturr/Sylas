package simf

type UpdateAliasSimfMessage struct {
	IdModAdvc UpdateAliasSimfRequest `json:"IdModAdvc" xml:"IdModAdvc"`
}

type UpdateAliasSimfRequest struct {
	GrpHdr GroupHeader        `json:"GrpHdr" xml:"GrpHdr"`
	Mod    UpdateAliasSimfMod `json:"Mod" xml:"Mod"`
}

type UpdateAliasSimfMod struct {
	EndToEndID string `json:"EndToEndId" xml:"EndToEndId"`
	Alias      string `json:"Alias" xml:"Alias"`
	AgentCode  string `json:"Agt" xml:"Agt"`
	Status     string `json:"Sts" xml:"Sts"`
}

type UpdateAliasCommand struct {
	MsgID      string
	CreDtTm    string
	EndToEndID string
	Alias      string
	AgentCode  string
	Status     string
}

type UpdateAliasSimfResponseMessage struct {
	IdVrfctnRpt UpdateAliasSimfResponse `json:"IdVrfctnRpt" xml:"IdVrfctnRpt"`
}

type UpdateAliasSimfResponse struct {
	GrpHdr       GroupHeader                 `json:"GrpHdr" xml:"GrpHdr"`
	OrgnlAssgnmt CreateUserSimfOrgnlAssgnmt  `json:"OrgnlAssgnmt" xml:"OrgnlAssgnmt"`
	Report       CreateUserSimfReport        `json:"Rpt" xml:"Rpt"`
	Mod          *UpdateAliasSimfResponseMod `json:"Mod,omitempty" xml:"Mod,omitempty"`
}

type UpdateAliasSimfResponseMod struct {
	Alias     string                `json:"Alias" xml:"Alias"`
	AgentCode string                `json:"Agt" xml:"Agt"`
	Status    string                `json:"Sts" xml:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty" xml:"Pty"`
}
