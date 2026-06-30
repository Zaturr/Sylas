package simf

// AntiphishingSimfQuery agrupa los criterios del GET anti-phishing por alias y banco destino.
//
// Ruta: GET /simf/bdca/v1/aliases/{Alias}/resolutions/{Agt_Destino}
type AntiphishingSimfQuery struct {
	Alias            string // valor del alias en el path
	DestinationAgent string // Agt_Destino: código CCE del banco destino
}
