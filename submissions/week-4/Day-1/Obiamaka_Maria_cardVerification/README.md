#ATM Card Number Verification

#Overview

This script verifies whether a given 16-digit ATM card number is valid based on the Luhn algorithm. It takes user input from the command line and determines if the card number is valid.

#How It Works

The user is prompted to enter a 16-digit card number.

The script checks that the input contains exactly 16 digits.

It applies the Luhn algorithm:

Doubles every second digit starting from the first.

If the result of doubling is greater than 9, the digits are summed.

All digits are summed together.

If the total sum ends in zero, the card number is valid; otherwise, it is invalid.

The result is displayed in the console.

Prerequisites

Node.js installed on your system.

#How to Run the Script

Open a terminal or command prompt.

Navigate to the directory where the script is saved.

Run the command:

node your_script.js

Enter a 16-digit card number when prompted.

The script will output whether the card number is valid or not.

#Example Output

Enter a 16-digit card number: 4539148803436467
The card number is valid.

Enter a 16-digit card number: 1234567890123456
The card number is invalid.

Notes:

Ensure the card number entered is exactly 16 digits.

