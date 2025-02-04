function validateCardNumber(cardNumber) {
    const digits = cardNumber.split('').map(Number);

    let sum = 0;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if ((digits.length - i) % 2 === 0) {
            digit *= 2;

            if (digit > 9) {
                digit = Math.floor(digit / 10) + (digit % 10);
            }
        }
     
        sum += digit;
    }
    return sum % 10 === 0;
}

const cardNumber = '5061240240202002103058';
if (validateCardNumber(cardNumber)) {
    console.log('Valid card number');
} else {
    console.log('Invalid card number');
}
