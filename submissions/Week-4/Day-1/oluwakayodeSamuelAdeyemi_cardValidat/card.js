function validCard(arr) {
    let sumAll = 0;

    for (let i = 0; i < arr.length; i++) {
        let num = arr[i];

        if (i % 2 === 0) {
            num = num * 2;
            if (num > 9) {
                num = Math.floor(num / 10) + (num % 10); 
            }
        }

        sumAll += num;
    }

    if (sumAll % 10 === 0) {
        console.log("This is a valid card number");
        return true;
    } else {
        console.log("This is NOT a valid card number");
        return false;
    }
}

// Test the function
console.log(validCard([4, 1, 3, 7, 8, 9, 4, 7, 1, 1, 7, 5, 5, 9, 0, 4])); // Example input
