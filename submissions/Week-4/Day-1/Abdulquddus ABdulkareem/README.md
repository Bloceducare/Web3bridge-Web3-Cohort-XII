# CardTest
README: Credit Card Number Validator
This Python script checks if a credit card number is valid using. Here's how it works:

How It Works
Input: The user enters a 16-digit credit card number.

Validation:

Checks if the number is 16 digits long.

Ensures all characters are digits.

Doubles every second digit (from the right).

If doubling results in a number > 9, subtract 9.

Sums all digits.

If the sum is divisible by 10, the card number is valid.