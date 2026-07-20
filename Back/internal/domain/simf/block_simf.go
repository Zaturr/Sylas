package simf

type BlockSimfMessage struct {
	IdModAdvc BlockSimfRequest `json:"IdModAdvc" xml:"IdModAdvc"`
}

type BlockSimfRequest struct {
	GrpHdr GroupHeader  `json:"GrpHdr" xml:"GrpHdr"`
	Mod    BlockSimfMod `json:"Mod" xml:"Mod"`
}

type BlockSimfMod struct {
	EndToEndID string `json:"EndToEndId" xml:"EndToEndId"`
	Alias      string `json:"Alias" xml:"Alias"`
	AgentCode  string `json:"Agt" xml:"Agt"`
	Status     string `json:"Sts" xml:"Sts"`
}

type BlockSimfCommand struct {
	MsgID      string
	CreDtTm    string
	EndToEndID string
	Alias      string
	AgentCode  string
	Status     string
}

type BlockSimfResponseMessage struct {
	IdVrfctnRpt BlockSimfResponse `json:"IdVrfctnRpt" xml:"IdVrfctnRpt"`
}

type BlockSimfResponse struct {
	GrpHdr       GroupHeader              `json:"GrpHdr" xml:"GrpHdr"`
	OrgnlAssgnmt CreateUserSimfOrgnlAssgnmt `json:"OrgnlAssgnmt" xml:"OrgnlAssgnmt"`
	Report       CreateUserSimfReport     `json:"Rpt" xml:"Rpt"`
	Mod          *BlockSimfResponseMod    `json:"Mod,omitempty" xml:"Mod,omitempty"`
}

type BlockSimfResponseMod struct {
	Alias     string                `json:"Alias" xml:"Alias"`
	AgentCode string                `json:"Agt" xml:"Agt"`
	Status    string                `json:"Sts" xml:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty" xml:"Pty"`
}
