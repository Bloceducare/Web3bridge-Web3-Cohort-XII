function validateCreditCard(cardNumber) {
    let digits = cardNumber.toString().split('').map(Number);
    let sum = 0;
    
    for (let i = digits.length - 1; i >= 0; i--) {
        let num = digits[i];
        
        if ((digits.length - i) % 2 === 0) {
            num *= 2;
            
            if (num > 9) {
                num = Math.floor(num / 10) + (num % 10);
            }
        }
        
        sum += num;
    }
    
    return sum % 10 === 0;
}

console.log(validateCreditCard(5199111034928866)); 






