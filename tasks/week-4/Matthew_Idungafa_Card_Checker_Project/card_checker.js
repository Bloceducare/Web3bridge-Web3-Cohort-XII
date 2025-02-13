
function checkCardNumber(cardNumber) {
    // Convert to string and split into array of numbers
    const digits = cardNumber.toString().split('').map(Number);
    console.log('Original card number:', digits.join(''));
    
    // Step 1: Double every second digit from the right (odd indices from end)
    const doubledDigits = digits.map((digit, index) => {
        // We need to work from right to left, so we use length - index - 1
        return ((digits.length - index - 1) % 2 === 1) ? digit * 2 : digit;
    });
    console.log('After doubling alternating digits:', doubledDigits.join(', '));
    
    // Step 2: Sum digits of numbers > 9
    const summedDigits = doubledDigits.map(num => {
        if (num > 9) {
            return Math.floor(num / 10) + (num % 10);
        }
        return num;
    });
    console.log('After summing digits > 9:', summedDigits.join(', '));
    
    // Step 3: Sum all digits
    const sum = summedDigits.reduce((acc, curr) => acc + curr, 0);
    console.log('Sum of all digits:', sum);
    
    // Step 4: Check if sum is divisible by 10
    const isValid = sum % 10 === 0;
    console.log(isValid ? 'Card number is valid' : 'Card number is not valid');
    
    return isValid;
}

// Test the function
const cardNumber = 5199111034928866;
checkCardNumber(cardNumber); 