function isValidCardNumber(cardNumber) {
  let num = [];
  let strCardNumber = cardNumber.toString();
  for (let i = 0; i < strCardNumber.length; i++) {
    let char = strCardNumber[i];
    if (char >= '0' && char <= '9') {
      num.push(Number(char));
    }
  }

  if (num.length < 13 || num.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = num[i];

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }
  if (sum % 10 === 0) {
    console.log('Valid card number');
    return true;
  } else {
    console.log('Invalid card number');
  }

  return false;
}

isValidCardNumber(5199110741698077);
