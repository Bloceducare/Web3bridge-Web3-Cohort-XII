# The Luhn Algorithm 

is a simple checksum formula used to validate a variety of identification numbers. here, it has been used to verify a credit card numbers. 

**How the alorithm works:**

1. Start from the Right: Read the card number from right to left.

2. Double Every Second Digit: Starting from the second-to-last digit (rightmost digit is ignored in the first step), double every second digit.

If doubling a digit results in a number greater than 9, subtract 9 from it. (Alternatively, sum the digits of the product.)

3. Sum All Digits: Add up all the digits (both modified and unmodified).

4. Check If It's a Multiple of 10 (aka a round number): If the total sum is a multiple of 10, the card number is valid. If not, it is invalid.

*a simple frontend has been added to this. run the index.html in your browser and enter a card to see if it is valid or not.*
