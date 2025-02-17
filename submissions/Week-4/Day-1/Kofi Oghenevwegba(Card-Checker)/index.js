function validateCreditCard(cardNumber) {
    // Remove any non-digit characters
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Convert the string to an array of digits
    let digits = cardNumber.split('').map(Number);
    
    // Step 1: Double every second digit
    for (let i = digits.length - 2; i >= 0; i -= 2) {
        digits[i] *= 2;
        // Step 2: If the result is greater than 9, add the digits
        if (digits[i] > 9) {
            digits[i] = Math.floor(digits[i] / 10) + (digits[i] % 10);
        }
    }
    
    // Step 3: Sum all the digits
    let sum = digits.reduce((acc, val) => acc + val, 0);
    
    // Step 4: Check if the total ends in 0
    return sum % 10 === 0;
}


let cardNumber = 'Replace with your Card Number';
console.log(validateCreditCard(cardNumber) ? 'Valid Card Number' : 'Invalid Card Number');