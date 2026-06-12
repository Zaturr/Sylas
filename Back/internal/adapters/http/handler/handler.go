package handler

import (
	"Alias_bdsa/Back/internal/ports"
	"encoding/json"
	"net/http"
)

type HTTpHandler struct {
	service ports.AliasService
}

// HTTPHandler estructura el controlador que expone los entry points del simulador.
func NewHTTPHandler(service ports.AliasService) *HTTpHandler {
	return &HTTpHandler{
		service: service,
	}
}

// CreateAliasRequest define el payload esperado del Front-End para registrar un alias.
type CreateAliasRequest struct {
	CustomerID string `json:"customer_id"`
	AliasValue string `json:"alias_value"`
}

// CreateAlias maneja la petición POST para registrar un nuevo alias único.
func (h *HTTpHandler) CreatedAlias(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req CreateAliasRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "JSON invalido"}`))
		return
	}

	alias, err := h.service.CreateAlias(r.Context(), req.CustomerID, req.AliasValue)
	if err != nil {
		w.WriteHeader(http.StatusUnprocessableEntity)
		w.Write([]byte(`{"error":` + err.Error() + `"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(alias)
}

// ResolveAlias maneja la petición GET para buscar y resolver las cuentas de un alias.
func (h *HTTpHandler) ResolveAlias(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	aliasValue := r.URL.Query().Get("value")
	if aliasValue == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "El alias es requerido"}`))
		return
	}
	customer, accounts, err := h.service.ResolveAlias(r.Context(), aliasValue)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error":"` + err.Error() + `}`))
		return
	}

	response := map[string]interface{}{
		"alias":    aliasValue,
		"customer": customer,
		"accounts": accounts,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *HTTpHandler) ListAllAlias(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	alias, err := h.service.GetAllAlias(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`"Error interno del servidor`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(alias)
}
