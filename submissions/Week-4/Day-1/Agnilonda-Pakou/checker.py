def check_card_number_validity(number):
    numbers = []
    # total = 0
    
    for i in range(len(number)):
        if i % 2 == 0:
            double = int(number[i]) * 2
            if double > 9:
                numbers.append(sum(int(digit) for digit in str(abs(double)) if digit.isdigit()))
            else:
                numbers.append(double)
        else:
            numbers.append(int(number[i]))
    
    
    result = sum(numbers)
    
    if abs(result) % 10 == 0:
        print("Valid card number")
    else :
        print("Invalid card number")

bank_card_number = input("Enter your card number : ").strip()
check_card_number_validity(bank_card_number)


# 4137894711755904