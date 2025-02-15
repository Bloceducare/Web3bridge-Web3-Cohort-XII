let cardNum = prompt("Enter card details:");

function verifCard(cardNumber) {
  const cardDigits = cardNumber.split("").map(Number);

  if (cardNumber.length === 16) {
    for (let i = cardDigits.length - 2; i >= 0; i -= 2) {
      let doubledDigit = cardDigits[i] * 2;
      
      if (doubledDigit > 9) {
        cardDigits[i] = doubledDigit - 9;
      } else {
        cardDigits[i] = doubledDigit;
      }
    }
    const total = cardDigits.reduce((sum, digit) => sum + digit, 0);
    
    if (total % 10 === 0) {
      console.log("Valid Card Number");
    } else {
      console.log("Invalid Card Number");
    }
  } else {
    console.log("Invalid Card Number");
  }
}

verifCard(cardNum);