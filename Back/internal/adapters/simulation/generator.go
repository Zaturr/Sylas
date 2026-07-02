package simulation

import (
	"Alias_bdca/Back/internal/domain"
	"fmt"
	"math/rand"
	"strings"

	"github.com/google/uuid"
)

var phonePrefixes = []string{"0414", "0424", "0412", "0416", "0426"}

// GenerateCustomer crea un cliente simulado con cuentas en bancos distintos.
func GenerateCustomer(config domain.RandomizerConfig, rng *rand.Rand) domain.GeneratedCustomer {
	nameData := generateRandomName(rng)

	cust := domain.GeneratedCustomer{
		ID:         uuid.New().String(),
		DocNumber:  fmt.Sprintf("%d", rng.Intn(34000000)+1000000),
		FirstName:  nameData.FullName,
		LastName:   nameData.FullLastName,
		Email:      fmt.Sprintf("%s.%s%d@gmail.com", nameData.BaseFirstName, nameData.BaseLastName, rng.Intn(99999)+1),
		Phone:      fmt.Sprintf("%s%07d", phonePrefixes[rng.Intn(len(phonePrefixes))], rng.Intn(10000000)),
		AliasID:    uuid.New().String(),
		AliasValue: generateAlias(rng, nameData.BaseFirstName, nameData.BaseLastName),
	}

	maxPossibleAccounts := len(config.Banks)
	if config.MaxAccountsPerCustomer < maxPossibleAccounts {
		maxPossibleAccounts = config.MaxAccountsPerCustomer
	}

	numAccounts := rng.Intn(maxPossibleAccounts) + 1

	availableBanks := make([]domain.BankSeed, len(config.Banks))
	copy(availableBanks, config.Banks)
	rng.Shuffle(len(availableBanks), func(i, j int) {
		availableBanks[i], availableBanks[j] = availableBanks[j], availableBanks[i]
	})

	for a := 0; a < numAccounts; a++ {
		bankID := availableBanks[a].ID
		cust.Accounts = append(cust.Accounts, domain.GeneratedAccount{
			ID:            uuid.New().String(),
			BankID:        bankID,
			AccountNumber: fmt.Sprintf("%s%016d", bankID, rng.Int63n(9999999999999999)),
		})
	}

	return cust
}

// generateAlias arma un alias de 6-15 caracteres con un solo punto, siempre en minusculas.
func generateAlias(rng *rand.Rand, fName, lName string) string {
	if len(fName) > 4 {
		fName = fName[:4]
	}
	if len(lName) > 4 {
		lName = lName[:4]
	}
	return strings.ToLower(fmt.Sprintf("%s.%s%04d", fName, lName, rng.Intn(10000)))
}
