package handler

import (
	"Alias_bdsa/Back/internal/domain"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateUserRequest struct {
	DocumentType   string                `json:"document_type"`
	DocumentNumber string                `json:"document_number"`
	FirstName      string                `json:"first_name"`
	LastName       string                `json:"last_name"`
	Email          string                `json:"email"`
	Phone          string                `json:"phone"`
	AliasValue     string                `json:"alias_value"`
	Accounts       []ManualAccountParams `json:"accounts"`
}

type ManualAccountParams struct {
	BankID        string `json:"bank_id"`
	AccountNumber string `json:"account_number"`
	AccountType   string `json:"account_type"`
}

func (h *HTTPHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, 400, "Datos no validos")
		return
	}

	//////////////////VALIDAR LOS DATOS DEL REQUEST//////////////////
	customerID := uuid.New().String()
	now := time.Now()

	customer := &domain.Customer{
		ID:             customerID,
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Email:          req.Email,
		Phone:          req.Phone,
		CreatedAt:      now,
	}

	var accounts []domain.Account
	for _, accReq := range req.Accounts {
		accounts = append(accounts, domain.Account{
			ID:            uuid.New().String(),
			BankID:        accReq.BankID,
			CustomerID:    customerID,
			AccountNumber: accReq.AccountNumber,
			AccountType:   accReq.AccountType,
			Status:        "ACTIVE",
			CreatedAt:     now,
		})
	}

	alias := &domain.Alias{
		ID:         uuid.New().String(),
		CustomerID: customerID,
		AliasValue: req.AliasValue,
		CreatedAt:  now,
	}

	//////////////////LLAMAR AL SERVICIO DE CREACION DE USUARIO//////////////////
	err := h.service.CreateFullUser(c.Request.Context(), customer, accounts, alias)
	if err != nil {
		respondError(c, 422, err.Error())
		return
	}

	//////////////////FINALIZAR LA RESPUESTA//////////////////
	c.JSON(201, gin.H{
		"message": "Usuario creado correctamente",
		"alias":   alias.AliasValue,
	})
}
