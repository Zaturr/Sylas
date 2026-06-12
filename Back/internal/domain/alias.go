package domain

import "time"

type Alias struct {
	ID         string    `json:"id"`
	CustomerID string    `json:"customer_id"`
	AliasValue string    `json:"alias_value"`
	CreatedAt  time.Time `json:"created_at"`
}
