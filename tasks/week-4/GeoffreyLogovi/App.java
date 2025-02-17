import java.util.Scanner;

public class App {

   public static boolean isValidCard(String cardNumber) {
       int sum = 0;
       boolean doubleDigit = false;

       for (int i = cardNumber.length() - 1; i >= 0; i--) {
           int digit = Character.getNumericValue(cardNumber.charAt(i));

           if (doubleDigit) {
               digit *= 2;
               if (digit > 9) {
                   digit = (digit % 10) + 1;
               }
           }

           sum += digit;
           doubleDigit = !doubleDigit;
       }

       return (sum % 10 == 0);
   }

   public static void main(String[] args) {
       Scanner scanner = new Scanner(System.in);
       System.out.print("Enter your credit/debit card number: ");
       String cardNumber = scanner.nextLine().replaceAll("\\s", "");

       if (cardNumber.matches("\\d+")) {
           if (isValidCard(cardNumber)) {
               System.out.println("The card number is VALID.");
           } else {
               System.out.println("The card number is INVALID.");
           }
       } else {
           System.out.println("Invalid input. Please enter only numeric digits.");
       }

       scanner.close();
   }
}
