package simf

// AliasResolveQuery agrupa los criterios de consulta del endpoint alias resolve.
type AliasResolveQuery struct {
	SchemeName string
	DocumentID string
	AgentCode  string
}

func (q AliasResolveQuery) HasAgent() bool {
	return q.AgentCode != ""
}

type AliasResolveGroupHeader struct {
	MsgID   string `json:"MsgId" xml:"MsgId"`
	CreDtTm string `json:"CreDtTm" xml:"CreDtTm"`
}

type AliasResolveTitular struct {
	Nm         string `json:"Nm,omitempty" xml:"Nm,omitempty"`
	DocumentID string `json:"Id" xml:"Id"`
	SchmeNm    string `json:"SchmeNm" xml:"SchmeNm"`
}

type AliasResolveAgentStatus struct {
	Agt string `json:"Agt" xml:"Agt"`
	Sts string `json:"Sts" xml:"Sts"`
}

type AliasResolveEntry struct {
	Alias   string                    `json:"Alias" xml:"Alias"`
	AgtList []AliasResolveAgentStatus `json:"AgtList" xml:"AgtList>Agt"`
}

type AliasResolveReport struct {
	Result    string               `json:"Result" xml:"Result"`
	Rsn       string               `json:"Rsn,omitempty" xml:"Rsn,omitempty"`
	Titular   *AliasResolveTitular `json:"Pty,omitempty" xml:"Pty,omitempty"`
	AliasList []AliasResolveEntry  `json:"AliasList,omitempty" xml:"AliasList>Alias"`
}

type AliasResolveResponse struct {
	GrpHdr AliasResolveGroupHeader `json:"GrpHdr" xml:"GrpHdr"`
	Report AliasResolveReport      `json:"InqRpt" xml:"InqRpt"`
}

type AliasResolveMessage struct {
	AlisIdInqRes AliasResolveResponse `json:"AlisIdInqRes" xml:"AlisIdInqRes"`
}
