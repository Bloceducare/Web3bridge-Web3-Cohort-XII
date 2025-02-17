import { useState } from "react";

const CardValidator = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState(null);

  const checkIfCardIsValid = (cardNumber) => {
    let digits = cardNumber.split("").map(Number);
    let processedValues = [];

    for (let i = 0; i < digits.length; i++) {
      let originalValue = digits[i];
      let doubleEachValue = originalValue;

      if (i % 2 === 0) {
        doubleEachValue = originalValue * 2;
        if (doubleEachValue > 9) {
          doubleEachValue = Math.floor(doubleEachValue / 10) + (doubleEachValue % 10);
        }
      }
      processedValues.push(doubleEachValue);
    }

    const totalSum = processedValues.reduce((acc, num) => acc + num, 0);
    setResult(totalSum % 10 === 0 ? "Valid Card" : "Invalid Card");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Card Validator</h1>
        <input
          type="text"
          className="border border-gray-300 p-2 w-full rounded-lg mb-4"
          placeholder="Enter Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <button
          onClick={() => checkIfCardIsValid(cardNumber)}
          className="bg-blue-500 text-white w-full p-2 rounded-lg hover:bg-blue-600"
        >
          Validate Card
        </button>
        {result && (
          <p className={`text-lg font-semibold mt-4 text-center ${result === "Valid Card" ? "text-green-600" : "text-red-600"}`}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardValidator;
