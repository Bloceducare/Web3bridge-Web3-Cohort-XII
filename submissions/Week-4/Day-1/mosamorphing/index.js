function isValidCardNumber(cardNumber) {
    let numbers = cardNumber.replace(/\D/g, '').split('').map(Number);
    let totalSum = 0;

    for (let i = numbers.length - 1; i >= 0; i--) { 
        let currentNumber = numbers[i];

        if ((numbers.length - 1 - i) % 2 === 1) { 
            currentNumber *= 2;
            if (currentNumber > 9) { 
                currentNumber -= 9;
            }
        }

        totalSum += currentNumber;
    }

    return totalSum % 10 === 0;
}

function checkCard() {
    let cardNumber = document.getElementById("cardNumber").value;
    let isValid = isValidCardNumber(cardNumber);
    document.getElementById("result").innerText = isValid ? "✅ Valid Card" : "❌ Invalid Card";
}
