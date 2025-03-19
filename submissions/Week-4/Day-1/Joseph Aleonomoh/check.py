def check(atm_card):
    if len(atm_card) != 16:
        raise ValueError("The number is not 16 digits long")
    if not atm_card.isdigit():
        raise ValueError("The number is not a number")
    total_sum = 0

    for i in range(16):
        digit = int(atm_card[15 - i])
        print(digit, "digit")
        print(i, "i")
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit = digit - 9
        total_sum += digit

    return total_sum % 10 == 0
    
while True:
    atm_card = input("Enter a 16 digit long number (Enter exit to end session): ")
    if atm_card == "exit":
        break
    try:
        if check(atm_card):
            print("The number is valid")
        else:
            print("The number is not valid")
    except ValueError as e:
        print(e)

    



