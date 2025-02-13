function isValidCardChecker(numbers) {
    if (numbers.length !== 16) {
        return false;
    }
    
    let sum = 0;
    let length = numbers.length;
    
    for (let i = length - 1; i >= 0; i--) { // Start from rightmost digit
        let num = parseInt(numbers[i], 10);
        
        if ((length - 1 - i) % 2 === 1) {  // Double every second digit from right
            num *= 2;
            if (num > 9) {
                num = Math.floor(num / 10) + (num % 10);  // Split and sum the digits
                //num -= 9; // Subtract 9 instead of summing digits
            }
        }
        
        sum += num;
    }
    
    return sum % 10 === 0;
}

// Example Usage
let cardNumber = "5399834429759517";
console.log("This card Number is valid:",isValidCardChecker(cardNumber));


