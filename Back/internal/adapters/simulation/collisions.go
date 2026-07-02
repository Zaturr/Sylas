package simulation

import (
	"Alias_bdca/Back/internal/domain"
	"fmt"
	"math/rand"
	"strings"
)

// ApplyCollisionFixes regenera campos duplicados dentro del lote o contra la BD.
// Devuelve true si aún quedan colisiones por resolver en otro ciclo.
func ApplyCollisionFixes(
	batch *[]domain.GeneratedCustomer,
	collidedDocs, collidedEmails, collidedPhones, collidedAliases, collidedAccs map[string]bool,
	rng *rand.Rand,
) bool {
	hasCollisions := false

	localDocs := make(map[string]bool)
	localEmails := make(map[string]bool)
	localPhones := make(map[string]bool)
	localAliases := make(map[string]bool)
	localAccs := make(map[string]bool)

	for i := range *batch {
		c := &(*batch)[i]

		if collidedDocs[c.DocNumber] || localDocs[c.DocNumber] {
			c.DocNumber = fmt.Sprintf("%d", rng.Intn(34000000)+1000000)
			hasCollisions = true
		}
		localDocs[c.DocNumber] = true

		if collidedEmails[c.Email] || localEmails[c.Email] {
			fName := lowerString(strings.Split(c.FirstName, " ")[0])
			lName := lowerString(strings.Split(c.LastName, " ")[0])
			c.Email = fmt.Sprintf("%s.%s%d@gmail.com", fName, lName, rng.Intn(999999)+1)
			hasCollisions = true
		}
		localEmails[c.Email] = true

		if collidedPhones[c.Phone] || localPhones[c.Phone] {
			c.Phone = fmt.Sprintf("%s%07d", phonePrefixes[rng.Intn(len(phonePrefixes))], rng.Intn(10000000))
			hasCollisions = true
		}
		localPhones[c.Phone] = true

		if collidedAliases[c.AliasValue] || localAliases[c.AliasValue] {
			fName := lowerString(strings.Split(c.FirstName, " ")[0])
			lName := lowerString(strings.Split(c.LastName, " ")[0])
			c.AliasValue = generateAlias(rng, fName, lName)
			hasCollisions = true
		}
		localAliases[c.AliasValue] = true

		for j := range c.Accounts {
			acc := &c.Accounts[j]
			if collidedAccs[acc.AccountNumber] || localAccs[acc.AccountNumber] {
				acc.AccountNumber = fmt.Sprintf("%s%016d", acc.BankID, rng.Int63n(9999999999999999))
				hasCollisions = true
			}
			localAccs[acc.AccountNumber] = true
		}
	}

	return hasCollisions
}
