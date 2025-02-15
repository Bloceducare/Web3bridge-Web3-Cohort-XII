def is_valid_card_number(card_number):

    if len(card_number) != 16:
        return False # to make sure the number is 16 digits
        
    sum_digits = 0
    double = False

    for digit in reversed(card_number):
        if not digit.isdigit():
            return False # to make sure the number is all digits
        
        n = int(digit)

        if double:
            n *= 2
            if n > 9:
                n -= 9  # Subtract 9 if the results is more than 9. (it is the the same thing as adding the two didgits of that range)
        
        sum_digits += n
        double = not double  # Toggle double flag

    # Check if the sum ends with zero
    return sum_digits % 10 == 0

card_number = input("Enter a credit card number: ").strip()

if is_valid_card_number(card_number):
    print("valid card number")
else:  
    print("invalid card number")
