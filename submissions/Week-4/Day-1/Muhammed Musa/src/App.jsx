import React, { useState } from "react";
// import "./CreditCardValidator.css";

const CreditCardValidator = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [isValid, setIsValid] = useState(null);

  const validateCard = () => {
    const cleanedNumber = cardNumber.replace(/\D/g, "");

    if (!cleanedNumber || cleanedNumber.length < 12) {
      setIsValid(false);
      return;
    }

    const digits = cleanedNumber.split("").map(Number).reverse();

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i];

      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    setIsValid(sum % 10 === 0);
  };

  return (
    <div className="validator-wrapper">
      <div className="validator-container">
        <div className="validator-card">
          <div className="validator-header">
            <h1>Credit Card Validator</h1>
          </div>

          <div className="validator-content">
            <div className="input-group">
              <label htmlFor="cardNumber">Card Number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Enter 16-digit card number"
                  maxLength="19"
                />
                <span className="card-icon">💳</span>
              </div>
            </div>

            <button onClick={validateCard}>Validate Card</button>

            {isValid !== null && (
              <div className="validation-result">
                <p
                  className={`validation-message ${
                    isValid ? "valid" : "invalid"
                  }`}
                >
                  {isValid ? "Valid Card Number" : "Invalid Card Number"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardValidator;
