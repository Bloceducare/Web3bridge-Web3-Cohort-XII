

function validateCard(cardNumber) {
    let digits = cardNumber.split("").map(Number); 
    let totalSum = 0;

    for (let i = 0; i < digits.length; i++) {
        let num = digits[i];
        console.log("for each of the i: "  + i)
        if (i % 2 === 0) { 
            console.log("after the odd " + i)
            num *= 2;
            if (num > 9) {
                num -= 9; 
            }
        }

        totalSum += num;
    }

    return totalSum % 10 === 0; 
}

const cardNumber = prompt("Please enter your card number:"); // User input
const isValid = validateCard(cardNumber);

if (isValid) {
    console.log("verify");
} else {
    console.log("not verify");
}



// hard code

// let digit = [5, 6, 7, 2, 6, 7, 2, 3, 7, 2, 7, 8, 11, 9];
// let totalSum = 0;

// for (let i = 0; i < digit.length; i++) {
//     if (digit[i] % 2 !== 0) { 
//         digit[i] *= 2; 
//         console.log("each digit" + digit[i])
//         if (digit[i] > 9) { 
//             let sumOfDigits = Math.floor(digit[i] / 10) + (digit[i] % 10); 
//             console.log("sumofdigit " + sumOfDigits)
//             digit[i] = sumOfDigits; 
//         }
//     }
//     totalSum += digit[i]; 
// }

// console.log(digit); 
// console.log(totalSum);



// if (totalSum % 10 === 0) {
//     console.log("verify");
// } else {
//     console.log("not verify");
// }
