package handler

import (
	"Alias_bdca/Back/internal/domain"
	"Alias_bdca/Back/internal/validations"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateUserRequest struct {
	DocumentType   string                `json:"document_type"`
	DocumentNumber string                `json:"document_number"`
	FirstName      string                `json:"first_name"`
	MiddleName     string                `json:"middle_name"`
	LastName       string                `json:"last_name"`
	SecondLastName string                `json:"second_last_name"`
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
	accountNumbers := make([]string, len(req.Accounts))
	accountTypes := make([]string, len(req.Accounts))
	for i, accReq := range req.Accounts {
		accountNumbers[i] = accReq.AccountNumber
		
		// Aseguramos que tengan un tipo de cuenta válido si viene vacío
		accType := strings.TrimSpace(accReq.AccountType)
		if accType == "" {
			if i == 0 {
				accType = "corriente"
			} else if i == 1 {
				accType = "ahorro"
			} else {
				accType = "dolares"
			}
		}
		accountTypes[i] = accType
		req.Accounts[i].AccountType = accType // Guardarlo en el req para que el resto del código lo use
	}
	if msg := validations.ValidateCreateUser(validations.CreateUserInput{
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		SecondLastName: req.SecondLastName,
		AliasValue:     req.AliasValue,
		AccountNumbers: accountNumbers,
		AccountType:    accountTypes,
	}); msg != "" {
		respondError(c, 400, msg)
		return
	}

	phone := strings.TrimSpace(req.Phone)
	if phone == "" {
		phone = validations.BuildVenezuelanPhoneFromDocument(req.DocumentNumber)
	} else if msg := validations.ValidateVenezuelanPhone(phone); msg != "" {
		respondError(c, 400, msg)
		return
	}

	email := strings.TrimSpace(req.Email)
	if email == "" {
		email = validations.BuildGmailFromCustomer(req.FirstName, req.MiddleName, req.LastName, req.SecondLastName, req.DocumentNumber)
	} else {
		email = validations.EnsureGmailAddress(email)
	}

	aliasValue := strings.TrimSpace(req.AliasValue)
	if aliasValue != "" {
		docType := strings.ToUpper(strings.TrimSpace(req.DocumentType))
		// Si NO es jurídico, gubernamental o comuna...
		if docType != "J" && docType != "G" && docType != "C" {
			// Buscamos si el cliente ya existe en BD
			existingCustomer, err := h.service.GetCustomerByDocument(c.Request.Context(), docType, req.DocumentNumber)
			if err == nil && existingCustomer != nil {
				// Buscamos si ese cliente ya tiene un alias activo
				activeAlias, errAlias := h.service.GetActiveAliasByCustomerID(c.Request.Context(), existingCustomer.ID)
				if errAlias == nil && activeAlias != nil {
					respondError(c, 400, "Este tipo de documento solo admite un alias activo por banco")
					return
				}
			}
		}
	}

	customerID := uuid.New().String()
	now := time.Now()

	customer := &domain.Customer{
		ID:             customerID,
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		FirstName:      req.FirstName,
		MiddleName:     req.MiddleName,
		LastName:       req.LastName,
		SecondLastName: req.SecondLastName,
		Email:          email,
		Phone:          phone,
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

	var alias *domain.Alias
	if aliasValue != "" {
		alias = &domain.Alias{
			ID:         uuid.New().String(),
			CustomerID: customerID,
			AliasValue: aliasValue,
			CreatedAt:  now,
		}
	}

	var errCreation error
	docTypeForBypass := strings.ToUpper(strings.TrimSpace(req.DocumentType))
	if docTypeForBypass == "J" || docTypeForBypass == "G" || docTypeForBypass == "C" {
		// Para respetar la restricción de NO tocar el código legacy/SIMF,
		// y permitir que J, G y C tengan múltiples alias, utilizamos la capa
		// de BD directamente, saltándonos RegisterSimfUser que los bloquearía.
		errCreation = h.service.CreateFullUser(c.Request.Context(), customer, accounts, alias)
	} else {
		errCreation = h.service.RegisterSimfUser(c.Request.Context(), customer, accounts, alias)
	}

	if errCreation != nil {
		status, message := mapSimfRegisterError(errCreation)
		respondError(c, status, message)
		return
	}

	responseAlias := aliasValue
	c.JSON(201, gin.H{
		"message": "Usuario creado correctamente",
		"alias":   responseAlias,
	})
}
