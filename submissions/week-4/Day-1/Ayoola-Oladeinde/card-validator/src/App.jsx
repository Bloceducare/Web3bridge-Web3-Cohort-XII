import { useState } from "react";


export default function CardValidator() {
  const [cardNumber, setCardNumber] = useState("");
  const [isValid, setIsValid] = useState(null);

  function isValidCardNumber(cardNumber) {
    let digits = cardNumber.toString().split('').map(Number);
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      if (i % 2 === 0) {
        let doubled = digits[i] * 2;
        if (doubled > 9) {
          doubled = Math.floor(doubled / 10) + (doubled % 10);
        }
        sum += doubled;
      } else {
        sum += digits[i];
      }
    }

    return sum % 10 === 0;
  }

  const handleCheck = () => {
    setIsValid(isValidCardNumber(cardNumber));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl shadow-md w-80">
      <h2 className="text-xl font-bold">Card Validator</h2>
      <input
        type="text"
        placeholder="Enter card number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        className="w-full p-2 border rounded-md"
      />
      <button onClick={handleCheck} className="w-full">Check</button>
      {isValid !== null && (
        <p className={`text-lg font-semibold ${isValid ? "text-green-500" : "text-red-500"}`}>
          {isValid ? "Valid Card Number" : "Invalid Card Number"}
        </p>
      )}
    </div>
  );
}
