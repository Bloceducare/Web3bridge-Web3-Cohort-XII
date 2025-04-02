numbers = []
console.log(numbers)

function validateCardNumber(cardNumber) {
  let digits = cardNumber.toString().split('').map(Number);
  let sum = 0;
  
  // console.log(digits);
  
  for (let i = digits.length - 2; i >= 0; i -= 2) {
    // console.log('i value', i);
    
      let doubled = digits[i] * 2;
      digits[i] = doubled > 9 ? doubled - 9 : doubled;
  }
  
  sum = digits.reduce((acc, val) => acc + val, 0);
  
  const total = sum % 10 === 0;
  // console.log(total);

  total ? console.log('ATM is Valid') : console.log('Dey play');
   
  
  return total;
}

// Example Usage
console.log(validateCardNumber(4137894711755904)); 

// console.log(validateCardNumber(2121)); 