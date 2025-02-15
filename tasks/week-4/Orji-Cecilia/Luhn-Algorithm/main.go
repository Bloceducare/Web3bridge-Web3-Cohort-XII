package main

import (
	"fmt"
	"strconv"
)

// validateCardNumber applies the Luhn Algorithm and returns the total sum and validity
func validateCardNumber(cardNumber string) (int, bool) {
	var sum int
	nDigits := len(cardNumber)

	// Step 1 & 2: Double every second digit from the right
	for i := 0; i < nDigits; i++ {
		// Start from the rightmost digit
		digit, err := strconv.Atoi(string(cardNumber[nDigits-1-i])) 
		if err != nil {
			fmt.Println("Invalid input:", err)
			return 0, false
		}

		// Every second digit from the right
		if i%2 == 1 { 
			digit *= 2
			// If > 9, sum the digits (same as digit - 9)
			if digit > 9 { 
				digit -= 9
			}
		}
		sum += digit
	}

	// Step 3 & 4: Check if sum is multiple of 10
	isValid := sum%10 == 0
	return sum, isValid
}

func main() {
	cardNumber := "4439101001076057" 

	totalSum, isValid := validateCardNumber(cardNumber)

	fmt.Println("Total Sum:", totalSum)
	if isValid {
		fmt.Println(cardNumber, "is a Valid Card Number ✅")
	} else {
		fmt.Println(cardNumber, "is an Invalid Card Number ❌")
	}
}
