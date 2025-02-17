function validateCardNumber(input) {

    let totalSum = 0;

    for (let i = 0; i < input.length; i++) {
        let cardDigit = parseInt(input[i], 10);
        if((input.length - 1) % 2 === 0) {
            cardDigit *2;

            if (cardDigit > 9) {
                cardDigit = Math.floor(cardDigit / 10) + (cardDigit % 10);
            }
        }

        totalSum += cardDigit;
    }

    // const a
    totalSum = Math.floor(totalSum / 10) * 10
    return totalSum
}

const result = validateCardNumber("19345978908234768");
console.log(result);