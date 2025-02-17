import { useState } from "react";

export default function App() {
    const [cardNumber, setCardNumber] = useState("");
    const [isValid, setIsValid] = useState(null);

    function validateCardNumber(cardNumber) {
        let digits = cardNumber.replace(/\D/g, "").split("").map(Number);
        digits.reverse();
        for (let i = 1; i < digits.length; i += 2) {
            digits[i] *= 2;
            if (digits[i] > 9) {
                digits[i] -= 9;
            }
        }
        const total = digits.reduce((sum, digit) => sum + digit, 0);
        return total % 10 === 0;
    }

    const handleCheck = () => {
        setIsValid(validateCardNumber(cardNumber));
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-4">ATM Card checker</h2>
                <input
                    type="text"
                    placeholder="Enter card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCheck}
                    className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                    Check Card
                </button>
                {isValid !== null && (
                    <div
                        className={`mt-4 text-center text-lg font-semibold ${
                            isValid ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {isValid ? "Valid Card Number ✅" : "Invalid Card Number ❌"}
                    </div>
                )}
            </div>
        </div>
    );
}
