// const cardNumber = "5061240202002103058"
const cardNumber = "6500041049870542"
const cardNumberArray = cardNumber.split("")

if (cardNumberArray.length < 16) {
    console.log("Invalid Card Number")
    return
} else if (cardNumberArray.length > 16) {
    console.log("Invalid Card Number")
    return
} else if (cardNumberArray.length === 16) {
    
// Step 1: double the value of every second digit
const doubledCardNumberArray = cardNumberArray.map((digit, index) => {
    if (index % 2 === 0) {
        let doubledDigit = digit * 2
        // step 2; if the result of this doubling operation is greater than 9 (e.g 16), then add the digits of the product (e..g. 1+6=7)
        if (doubledDigit > 9) {
            return String(doubledDigit).split("").reduce((acc, curr) => parseInt(acc) + parseInt(curr))
        } else {
            return doubledDigit
        }
    } else {
       return digit
    }
})
// step 3; Take the sum of all the digits 
const sumOfDigits = doubledCardNumberArray.reduce((acc, curr) => parseInt(acc) + parseInt(curr))
console.log(sumOfDigits)

// step 4; If the total end in zero, this is a valid card number, if not it is an invalid card number. 
if (sumOfDigits % 10 === 0) {
    console.log("Valid Card Number")
} else {
    console.log("Invalid Card Number")
}
} else{
    console.log("Unable to validate your card")
}
