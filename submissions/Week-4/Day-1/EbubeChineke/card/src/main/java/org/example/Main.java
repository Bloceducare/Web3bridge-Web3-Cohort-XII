package org.example;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");

        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a 16-digit credit card number: ");
        String cardNumber = scanner.nextLine();

        if (isValidCard(cardNumber)) {
            System.out.println("✅ Valid Card Number");
        } else {
            System.out.println("❌ Invalid Card Number");
        }

        scanner.close();
    }

    public static boolean isValidCard(String cardNumber) {
        if (cardNumber.length() != 16 || !cardNumber.matches("\\d+")) {
            return false; // Ensure it's a 16-digit numeric input
        }

        int sum = 0;
        boolean doubleDigit = false;

        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cardNumber.charAt(i));

            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) {
                    digit = digit % 10 + digit / 10; // Sum the digits if > 9 (e.g., 16 → 1 + 6 = 7)
                }
            }

            sum += digit;
            doubleDigit = !doubleDigit; // Alternate between doubling and not doubling
        }

        System.out.println("Sum of all digits: " + sum);
        return sum % 10 == 0; // If sum ends in 0, it's valid
    }
}