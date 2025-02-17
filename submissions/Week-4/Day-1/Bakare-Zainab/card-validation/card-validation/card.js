
        function isValidATMNumber(cardNumber) {
            if (!/^[0-9]{16}$/.test(cardNumber)) {
                return false;
            }
            
            let sum = 0;
            let shouldDouble = false;
            
            for (let i = cardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(cardNumber[i]);
                
                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) {
                        digit = Math.floor(digit / 10) + (digit % 10);
                    }
                }
                
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            
            return sum % 10 === 0;
        }

        function validateCard() {
            const cardNumber = document.getElementById("cardNumber").value;
            const result = document.getElementById("result");
            
            if (isValidATMNumber(cardNumber)) {
                result.textContent = "Valid ATM Number";
                result.style.color = "green";
            } else {
                result.textContent = "Invalid ATM Number";
                result.style.color = "red";
            }
        }
    









// function isValidATMNumber(cardNumber) {
//     if (!/^[0-9]{16}$/.test(cardNumber)) {
//         return false; // Ensure it's a 16-digit number
//     }
    
//     let sum = 0;
//     let shouldDouble = false;
    
//     for (let i = cardNumber.length - 1; i >= 0; i--) {
//         let digit = parseInt(cardNumber[i]);
        
//         if (shouldDouble) {
//             digit *= 2;
//             if (digit > 9) {
//                 digit = Math.floor(digit / 10) + (digit % 10); // Sum the digits if greater than 9
//             }
//         }
        
//         sum += digit;
//         shouldDouble = !shouldDouble;
//     }
    
//     return sum % 10 === 0;
// }

// // Example usage
// console.log(isValidATMNumber("4532015112830366")); // true or false
// console.log(isValidATMNumber("1234567812345670")); // false
