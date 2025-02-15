function cardTest(ATMNumber) {
    const splittedCardNumber = ATMNumber.toString().split("");

    let total = 0;
    
    for (let i = 0; i < splittedCardNumber.length; i++) {
        let num = parseInt(splittedCardNumber[i]);
        if(i % 2 == 0) {
            num = num * 2;
            if(num > 9) {
                const result = num.toString().split("");
                const twoDigitSum = parseInt(result[0]) + parseInt(result[1]);
                total += twoDigitSum;
            } else {
                total += num;
            }
        } else {
            total += num;
        }
    }
    
    const totalToString = total.toString().split("");
    
    const lastDigit = parseInt(totalToString[totalToString.length - 1]);
    
    return `${ATMNumber} is ` + (lastDigit == 0 ? "a valid card number." : "an invalid card number.")
    };
    
    console.log(cardTest(7850107279736861));
    console.log(cardTest(7850107279736862));
    