package simf

import "encoding/xml"

// CreateEntradaDocument es la raíz XML exigida por Alias-Entrada-simf.xsd (Document/IdModAdvc).
type CreateEntradaDocument struct {
	XMLName   xml.Name              `xml:"Document"`
	IdModAdvc CreateUserSimfRequest `xml:"IdModAdvc"`
}

// UpdateEntradaDocument envoltorio XSD para actualización de alias.
type UpdateEntradaDocument struct {
	XMLName   xml.Name               `xml:"Document"`
	IdModAdvc UpdateAliasSimfRequest `xml:"IdModAdvc"`
}

// BlockEntradaDocument envoltorio XSD para bloqueo/baja de alias.
type BlockEntradaDocument struct {
	XMLName   xml.Name         `xml:"Document"`
	IdModAdvc BlockSimfRequest `xml:"IdModAdvc"`
}
