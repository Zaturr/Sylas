package simf

// Constantes compartidas entre endpoints SIMF (Result, Rsn, Sts, SchmeNm).
// Cada endpoint tiene su propio archivo de tipos; las reglas de negocio
// comunes viven aquí para no duplicarlas.

// SchemeName — esquema del documento (SchmeNm, 4 caracteres).
const (
	SchemeSCID = "SCID"
	SchemeSRIF = "SRIF"
	SchemeSPAS = "SPAS"
)

// Result — resultado del reporte (4 caracteres).
const (
	ResultAccept = "ACCP"
	ResultReject = "RJCT"
)

// Reason — motivo de rechazo (Rsn, 4 caracteres).
const (
	ReasonNone              = ""
	ReasonAliasTaken        = "ACRD"
	ReasonFormat            = "RR10"
	ReasonBlacklist         = "RR04"
	ReasonNotFound          = "BE23"
	ReasonAliasLimit        = "AG01"
	ReasonAliasBlocked      = "AC06"
	ReasonUnauthorizedIBP   = "AG08"
)

// Status — estado del vínculo alias-agente (Sts, 4 caracteres).
const (
	StatusActive       = "ACTV"
	StatusInactive     = "INAC"
	StatusPendingDrop  = "PNDL"
	StatusBlocked      = "BLKD"
	StatusUnregistered = "UNRG"
)
