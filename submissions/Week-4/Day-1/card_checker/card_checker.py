card_number = input("Enter your card: ").strip()

def card_checker(number):
    n = 0  # next second number
    p = 0 # previous number
    num_sum = 0
    double = []
    numbers = []
    list_num = []
    for i in card_number:
        if i != " ":
            numbers.append(int(i))

    for j in range(len(numbers)):
        if j == 0:
            double.append(numbers[j] * 2)
        p = j + 1
        n = j + 2

        if n < len(numbers) and p < len(numbers):
            double_numbers = numbers[n] * 2
            if double_numbers > 9:
                double_numbers = double_numbers - 9
            double.append(double_numbers)

        if p < len(numbers) and n >= len(numbers):
            list_num.append(numbers[p])
    
    lis_su = list_num + double
    num_sum = sum(list_num + double)

    print(lis_su)
    
    if num_sum % 2 != 0:
        print("This card is not a valid card")
    else:
        print("valid card")


if __name__ == "__main__":
    card_checker(card_number)