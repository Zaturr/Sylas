package handler

import (
	"Alias_bdsa/Back/internal/domain"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AddAccountRequest struct {
	DocumentNumber string `json:"document_number" binding:"required"`
	Email          string `json:"email" binding:"required,email"`
	AliasValue     string `json:"alias_value" binding:"required"`
	BankID         string `json:"bank_id" binding:"required"`
	AccountNumber  string `json:"account_number" binding:"required"`
	AccountType    string `json:"account_type" binding:"required"`
}

// AddAccount maneja la petición POST para agregar una cuenta a un cliente existente verificando su identidad
func (h *HTTPHandler) AddAccount(c *gin.Context) {
	var req AddAccountRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Datos inválidos o incompletos", "details": err.Error()})
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
		c.JSON(422, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{
		"message": "Cuenta agregada exitosamente al usuario",
		"account_number": account.AccountNumber,
	})
}
