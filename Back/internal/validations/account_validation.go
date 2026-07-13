package validations

import (
	"regexp"
	"strconv"
)

func IsValidAccount(value string) bool {
	matched, _ := regexp.MatchString(`^\d{20}$`, value)
	if !matched {
		return false
	}

	bankCode := value[0:4]
	office := value[4:8]
	controlDigitStr := value[8:10]
	account := value[10:20]

	firstDigit := GetDigitValue(bankCode + office)
	secondDigit := GetDigitValue(office + account)

	controlDigit, err := strconv.Atoi(controlDigitStr)
	if err != nil {
		return false
	}
	expectedControl := (firstDigit * 10) + secondDigit
	return controlDigit == expectedControl
}

func GetDigitValue(digits string) int {
	pesos := []int{3, 2, 7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2}
	result := 0

	for i := 0; i < len(digits); i++ {
		numericValue := int(digits[i] - '0')
		pesoActual := pesos[i%len(pesos)]
		result += numericValue * pesoActual
	}
	result = 11 - (result % 11)
	if result >= 10 {
		if result == 10 {
			return 0
		}
		return 1
	}
	return result
}
