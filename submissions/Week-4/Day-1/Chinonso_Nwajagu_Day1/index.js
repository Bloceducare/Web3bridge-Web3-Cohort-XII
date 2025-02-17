function validateCard(cardNumber) {
    // Remove all non-numeric characters
    cardNumber = cardNumber.replace(/\D/g, "");

    // Check if card number is between 13 and 19 digits
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return "Invalid Card Number (Must be 13-19 digits)";
    }

    return luhnCheck(cardNumber) ? "✅ Valid Card Number" : "Invalid Card Number";
}

function luhnCheck(num) {
    let sum = 0;
    let alternate = false;

    // Loop through each digit from right to left
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);

        if (alternate) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        alternate = !alternate;
    }

    return sum % 10 === 0;
}

// function luhnCheck(num) {
//     let sum = 0;
//     let alternate = num.length % 2 === 0; // Flip for every second digit

//     for (let i = 0; i < num.length; i++) {
//         let digit = parseInt(num[i], 10);

//         if (alternate) {
//             digit *= 2;
//             if (digit > 9) digit -= 9;
//         }

//         sum += digit;
//         alternate = !alternate; // Flip alternate for the next digit
//     }

//     return sum % 10 === 0;
// }


// Example Usage:
console.log(validateCard("4111111111111111")); // ✅ Valid Card Number

