package corexml

import (
	"encoding/xml"
	"io"
	"net/http"
	"strings"

	"Alias_bdca/Back/internal/ports"

	"github.com/gin-gonic/gin"
)

const xmlContentType = "application/xml; charset=utf-8"

// Handler expone el core bancario SIMF en /simf/bdca/v1 con XML puro (servicio 3).
// Las rutas SIMF se respetan tal cual; el formato aquí es solo XML, no JSON.
type Handler struct {
	core ports.AliasService
}

func NewHandler(core ports.AliasService) *Handler {
	return &Handler{core: core}
}

func writeXML(c *gin.Context, status int, payload any) {
	xmlBody, err := xml.Marshal(payload)
	if err != nil {
		writeInternalError(c)
		return
	}
	if !strings.HasPrefix(string(xmlBody), "<?xml") {
		xmlBody = append([]byte(xml.Header), xmlBody...)
	}
	c.Data(status, xmlContentType, xmlBody)
}

func readXMLBody(c *gin.Context, dest any) error {
	raw, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return err
	}
	return xml.Unmarshal(raw, dest)
}

func writeInternalError(c *gin.Context) {
	c.Data(http.StatusInternalServerError, xmlContentType, []byte(xml.Header+"<error>error interno del servidor</error>"))
}
