function card_Check(cardNumber) {
    let sum = 0;
    let digits = cardNumber.split('').reverse().map(Number);
    
    digits.forEach( num, i=> {
        
    });((num, i) => {
        if (i % 2 !== 0) {
            num *= 2;
            if (num > 9) num -= 9;
        }
        sum += num;
    });
    
    return sum % 10 === 0;
}

// Example usage
let cardNumber = "5199111074928866";
console.log(`${cardNumber} is ${card_Check(cardNumber) ? 'valid' : 'invalid'} card number.`);
