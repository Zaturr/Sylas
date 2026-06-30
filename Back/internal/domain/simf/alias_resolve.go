package simf

// AliasResolveQuery agrupa los criterios de consulta del endpoint alias resolve.
// Proviene de los path params; no depende de Gin ni de JSON.
//
// Rutas:
//   - GET .../identities/{SchmeNm}/{Id}/Alias       → AgentCode vacío
//   - GET .../identities/{SchmeNm}/{Id}/alias/{Agt} → AgentCode = Agt
type AliasResolveQuery struct {
	SchemeName string // SchmeNm: SCID | SRIF | SPAS
	DocumentID string // Id:   V12345678, J000123456, P...
	AgentCode  string // Agt:  4 chars CCE; vacío = consulta sin banco destino
}

// HasAgent indica si la consulta incluye un agente/banco específico (anti-phishing).
func (q AliasResolveQuery) HasAgent() bool {
	return q.AgentCode != ""
}

// --- Tipos de respuesta: AlisIdInqRes (mensaje SIMF del endpoint alias resolve) ---

// AliasResolveGroupHeader cabecera del mensaje (GrpHdr).
type AliasResolveGroupHeader struct {
	MsgID   string `json:"MsgId"`
	CreDtTm string `json:"CreDtTm"`
}

// AliasResolveTitular datos del titular en el reporte (JSON: Pty).
type AliasResolveTitular struct {
	Nm         string `json:"Nm,omitempty"`
	DocumentID string `json:"Id"`
	SchmeNm    string `json:"SchmeNm"`
}

// AliasResolveAgentStatus estado de un banco en la lista (AgtList item).
type AliasResolveAgentStatus struct {
	Agt string `json:"Agt"`
	Sts string `json:"Sts"`
}

// AliasResolveEntry alias con sus agentes (AliasList item).
type AliasResolveEntry struct {
	Alias   string                    `json:"Alias"`
	AgtList []AliasResolveAgentStatus `json:"AgtList"`
}

// AliasResolveReport cuerpo del reporte de alias resolve (JSON: InqRpt).
type AliasResolveReport struct {
	Result    string                `json:"Result"`
	Rsn       string                `json:"Rsn,omitempty"`
	Titular   *AliasResolveTitular `json:"Pty,omitempty"`
	AliasList []AliasResolveEntry   `json:"AliasList,omitempty"`
}

// AliasResolveResponse payload interno del mensaje (AlisIdInqRes).
type AliasResolveResponse struct {
	GrpHdr AliasResolveGroupHeader `json:"GrpHdr"`
	Report AliasResolveReport      `json:"InqRpt"`
}

// AliasResolveMessage envoltorio raíz del JSON de respuesta HTTP.
type AliasResolveMessage struct {
	AlisIdInqRes AliasResolveResponse `json:"AlisIdInqRes"`
}
