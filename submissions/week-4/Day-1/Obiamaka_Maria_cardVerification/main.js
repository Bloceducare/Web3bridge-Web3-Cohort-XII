const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* @isValidCardNumber - this function inplements an algorithm 
*  that verifies if a credit card is authentic
*   @param  - it takes in the 16 digits of the card and return true or false 
*/

function isValidCardNumber(cardNumber) {
    // Ensure the input is a string of exactly 16 digits
    if (!/^\d{16}$/.test(cardNumber)) {
        return false;
    }
    
    let sum = 0;
    
    for (let i = 0; i < 16; i++) {
        let digit = parseInt(cardNumber[i]);
        
        // Double every second digit, including the first one (even indices)
        if (i % 2 === 0) {
            digit *= 2;
            
            // If the doubled value is greater than 9, sum its digits
            if (digit > 9) {
                digit = Math.floor(digit / 10) + (digit % 10);
            }
        }
        
        sum += digit;
    }
    
    // Step 4: Check if the total sum ends in zero
    return sum % 10 === 0;
}

rl.question('Enter a 16-digit card number: ', (cardNumber) => {
    if (isValidCardNumber(cardNumber)) {
        console.log('The card number is valid.');
    } else {
        console.log('The card number is invalid.');
    }
    rl.close();
});
