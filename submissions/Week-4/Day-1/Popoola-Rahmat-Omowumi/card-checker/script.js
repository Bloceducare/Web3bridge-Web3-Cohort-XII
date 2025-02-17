
function validateCard(cardNumber) {
    let digits = cardNumber.toString().split('').map(Number);
    
    
    for (let i = 0; i < digits.length; i += 2) { 
        digits[i] *= 2;
        if (digits[i] > 9) {
            digits[i] = Math.floor(digits[i] / 10) + (digits[i] % 10);

    let total = digits.reduce((sum, num) => sum + num, 0);

   
    return total % 10 === 0 ? "Valid Card Number" : "Invalid Card Number";
}


let cardNumber = 4532015112830366; 
console.log(validateCard(cardNumber)); 
