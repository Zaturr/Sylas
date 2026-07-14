package simf

// Ruta: GET /simf/bdca/v1/aliases/{Alias}/resolutions/{Agt_Destino}
type AntiphishingSimfQuery struct {
	Alias            string
	DestinationAgent string
}
