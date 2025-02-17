import { useState } from "react";
import './index.css'

export default function CardValidator() {
  const [cardNumber, setCardNumber] = useState("");
  const [isValid, setIsValid] = useState(null);

  function validateCardNumber(cardNumber) {
    const digits = cardNumber.split("").map(Number);
    let sum = 0;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }

    return sum % 10 === 0;
  }

  function handleValidation() {
    setIsValid(validateCardNumber(cardNumber));
  }

  return (
    <>
      {/* <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Card Number Validator
          </h2>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter card number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white p-2 mt-4 rounded-md hover:bg-blue-600 transition"
            onClick={handleValidation}
          >
            Validate
          </button>
          {isValid !== null && (
            <div
              className={`mt-4 text-center font-semibold p-2 rounded-md ${
                isValid
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {isValid ? "Valid Card Number ✅" : "Invalid Card Number ❌"}
            </div>
          )}
        </div>
      </div> */}
      {/* second */}
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">RealSatisfied</h1>
          <div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mr-4">
              Log In
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Sign Up
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Banner Section */}
          <div className="relative">
            <img
              src="https://via.placeholder.com/1500x400"
              alt="Background"
              className="w-full h-48 object-cover"
            />
            <div className="absolute -bottom-12 left-8 flex items-center">
              <img
                src="https://via.placeholder.com/120"
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white"
              />
              <div className="ml-4 text-white">
                <h2 className="text-xl font-semibold">Tom Fisher</h2>
                <p className="text-sm">Real Estate Professional</p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-8 mt-12">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Contact Me</h3>
                  <p>Office: (555) 995-1599</p>
                  <p>Mobile: (555) 995-1599</p>
                  <button className="bg-green-500 text-white px-4 py-2 mt-4 w-full rounded-lg hover:bg-green-600">
                    Contact Me
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Awards</h3>
                  <p>🏆 Top Producer</p>
                  <p>🏆 Outstanding Service</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Brokerage</h3>
                  <p>North East Real Estate</p>
                </div>
              </div>

              {/* Middle Section */}
              <div className="col-span-2 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p>
                    Boston's Top Real Estate Agent
                    <br />
                    I'm dedicated to helping my clients find the home of their
                    dreams. Whether you are buying or selling a home or just
                    curious about the local market, I would love to offer my
                    services.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">
                    Customer Reviews
                  </h3>
                  <p>
                    <span className="text-yellow-500">★★★★★</span> 5.0
                    Satisfaction
                    <br />
                    Super responsive and expert professionalism! We just found
                    our new home with Tom and would highly recommend him.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
