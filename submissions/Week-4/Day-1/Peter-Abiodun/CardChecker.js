function CardChecker(input) {
    console.log("input is", input);
    if (input.length !== 16) {
        return "Invalid input. Count should be 16 numbers.";
    }

    let digits = input.split('');

    console.log("length is", digits.length);

    if (!digits.every(char => !isNaN(char))) {
        return "Invalid inputs found. Only numbers allowed.";
    }

    digits = digits.map(Number);

    let sum = 0;
    let doubleDigit = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) {
                digit = Math.floor(digit / 10) + (digit % 10); 
            }
        }

        sum += digit;
        doubleDigit = !doubleDigit;
    }

    console.log("sum is", sum);
    return sum % 10 === 0 ? `${input} is a VALID Card Number` : `${input} is an INVALID Card Number`;
}

// Example usage:
let input = "5199111034928866";
let input2 = "3782822463100155";
let input3 = "12f3456789014345";
let input4 = "54323456789014345";
console.log(CardChecker(input), '\n'); 
console.log(CardChecker(input2), '\n'); 
console.log(CardChecker(input3), '\n'); 
console.log(CardChecker(input4), '\n');