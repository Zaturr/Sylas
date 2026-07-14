package domain

import "time"

type Customer struct {
	ID             string    `json:"id"`
	DocumentType   string    `json:"document_type"`
	DocumentNumber string    `json:"document_number"`
	FirstName      string    `json:"first_name"`
	MiddleName     string    `json:"middle_name"`
	LastName       string    `json:"last_name"`
	SecondLastName string    `json:"second_last_name"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	CreatedAt      time.Time `json:"created_at"`
}
