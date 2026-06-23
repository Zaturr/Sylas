package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// DeleteAllAliases elimina todos los alias con su cliente y cuentas (?confirm=true).
func (h *HTTPHandler) DeleteAllAliases(c *gin.Context) {
	if c.Query("confirm") != "true" {
		respondError(c, http.StatusBadRequest, "Debe confirmar la eliminacion con ?confirm=true")
		return
	}

	deleted, err := h.service.RemoveAllAliases(c.Request.Context())
	if err != nil {
		respondError(c, http.StatusInternalServerError, "No se pudieron eliminar los registros")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Todos los alias y datos relacionados fueron eliminados",
		"deleted_count": deleted,
	})
}

// DeleteAliasByValue elimina un alias por su valor junto con cliente y cuentas.
func (h *HTTPHandler) DeleteAliasByValue(c *gin.Context) {
	aliasValue := strings.TrimSpace(c.Param("value"))
	if aliasValue == "" {
		respondError(c, http.StatusBadRequest, "El alias es requerido")
		return
	}

	err := h.service.RemoveAliasByValue(c.Request.Context(), aliasValue)
	if err != nil {
		if err.Error() == "alias no encontrado" {
			respondError(c, http.StatusNotFound, err.Error())
			return
		}
		respondError(c, http.StatusUnprocessableEntity, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Alias y datos relacionados eliminados correctamente",
		"alias":   aliasValue,
	})
}

// DeleteUserByCustomerID elimina un cliente por ID junto con su alias y cuentas.
func (h *HTTPHandler) DeleteUserByCustomerID(c *gin.Context) {
	customerID := strings.TrimSpace(c.Param("customer_id"))
	if customerID == "" {
		respondError(c, http.StatusBadRequest, "El identificador del cliente es requerido")
		return
	}

	err := h.service.RemoveAliasByCustomerID(c.Request.Context(), customerID)
	if err != nil {
		if err.Error() == "cliente no encontrado" {
			respondError(c, http.StatusNotFound, err.Error())
			return
		}
		respondError(c, http.StatusUnprocessableEntity, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Cliente, alias y cuentas eliminados correctamente",
		"customer_id": customerID,
	})
}

// DeleteAliasByID elimina un alias por su ID interno junto con cliente y cuentas.
func (h *HTTPHandler) DeleteAliasByID(c *gin.Context) {
	aliasID := strings.TrimSpace(c.Param("id"))
	if aliasID == "" {
		respondError(c, http.StatusBadRequest, "El identificador del alias es requerido")
		return
	}

	err := h.service.RemoveAlias(c.Request.Context(), aliasID)
	if err != nil {
		if err.Error() == "alias no encontrado" {
			respondError(c, http.StatusNotFound, err.Error())
			return
		}
		respondError(c, http.StatusUnprocessableEntity, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Alias y datos relacionados eliminados correctamente",
		"alias_id": aliasID,
	})
}
