package handler

import (
	"Alias_bdca/Back/internal/domain"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AddAccountRequest struct {
	DocumentNumber string `json:"document_number" binding:"required"`
	Email          string `json:"email""`
	AliasValue     string `json:"alias_value""`
	BankID         string `json:"bank_id" binding:"required"`
	AccountNumber  string `json:"account_number" binding:"required"`
	AccountType    string `json:"account_type" binding:"required"`
}

// AddAccount maneja la petición POST para agregar una cuenta a un cliente existente verificando su identidad
func (h *HTTPHandler) AddAccount(c *gin.Context) {
	var req AddAccountRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, 400, "Datos invalidos o incompletos")
		return
	}

	account := &domain.Account{
		ID:            uuid.New().String(),
		BankID:        req.BankID,
		AccountNumber: req.AccountNumber,
		AccountType:   req.AccountType,
		Status:        "ACTIVE",
		CreatedAt:     time.Now(),
	}

	err := h.service.AddAccountToCustomer(c.Request.Context(), req.DocumentNumber, req.Email, req.AliasValue, account)
	if err != nil {
		respondError(c, 422, err.Error())
		return
	}

	c.JSON(201, gin.H{
		"message":        "Cuenta agregada exitosamente al usuario",
		"account_number": account.AccountNumber,
	})
}
