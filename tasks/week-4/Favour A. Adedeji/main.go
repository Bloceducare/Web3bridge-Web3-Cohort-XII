package main

import "fmt"

func isCardValid(cardNumber [16]int) bool {
	var total int
	for i := 0; i < len(cardNumber); i++ {
		if i%2 == 0 {
			product := cardNumber[i] * 2
			if product > 9 {
				product = 1 + (product % 10)
			}
			cardNumber[i] = product
		}
		total += cardNumber[i]
	}
	return total % 10 == 0

}

func main() {
	result := isCardValid([16]int{4, 1, 3, 7, 8, 9, 4, 7, 1, 1, 7, 5, 5, 9, 0, 4})
	fmt.Println(result)
}