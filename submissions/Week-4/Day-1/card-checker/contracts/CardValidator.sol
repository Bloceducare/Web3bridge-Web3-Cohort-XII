// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CardValidator {    
    function isValidCard(uint256 cardNumber) public pure returns (bool) {
        require(cardNumber >= 1e15 && cardNumber < 1e16, "Invalid card length");

        uint256 sum = 0;
        bool doubleDigit = false;        uint256 tempNumber = cardNumber;

        for (uint8 i = 0; i < 16; i++) {
            uint256 digit = tempNumber % 10;
            tempNumber /= 10;


            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit / 10) + (digit % 10);
                }
            }

            sum += digit;
            doubleDigit = !doubleDigit;
        }

        return (sum % 10 == 0);
    }
}
