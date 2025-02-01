// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarRental {
    address public owner;

    enum CarStatus {
        Available,
        Rented
    }

    struct Car {
        uint id;
        string model;
        uint dailyRate;
        CarStatus status;
    }

    struct Rental {
        address renter;
        uint rentalStart;
        uint rentalDays;
    }

    mapping(uint => Car) public cars;
    mapping(uint => Rental) public rentals;
    uint public carCount;

    event CarAdded(uint carId, string model, uint dailyRate);
    event CarRented(uint carId, address renter, uint rentalDays);
    event CarReturned(uint carId, address renter, uint rentalFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier carExists(uint carId) {
        require(carId > 0 && carId <= carCount, "Car does not exist");
        _;
    }

    modifier isAvailable(uint carId) {
        require(
            cars[carId].status == CarStatus.Available,
            "Car is not available"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCar(string memory _model, uint _dailyRate) external onlyOwner {
        require(_dailyRate > 0, "Daily rate must be greater than zero");
        carCount++;
        cars[carCount] = Car(carCount, _model, _dailyRate, CarStatus.Available);
        emit CarAdded(carCount, _model, _dailyRate);
    }

    function rentCar(
        uint carId,
        uint rentalDays
    ) external payable carExists(carId) isAvailable(carId) {
        require(rentalDays > 0, "Rental period must be at least one day");
        uint totalCost = cars[carId].dailyRate * rentalDays;
        require(msg.value >= totalCost, "Insufficient payment");

        cars[carId].status = CarStatus.Rented;
        rentals[carId] = Rental(msg.sender, block.timestamp, rentalDays);

        emit CarRented(carId, msg.sender, rentalDays);
    }

    function returnCar(uint carId) external carExists(carId) {
        Rental memory rental = rentals[carId];
        require(rental.renter == msg.sender, "You did not rent this car");
        require(
            cars[carId].status == CarStatus.Rented,
            "Car is not currently rented"
        );

        cars[carId].status = CarStatus.Available;
        uint rentalFee = cars[carId].dailyRate * rental.rentalDays;
        delete rentals[carId];
        payable(msg.sender).transfer(rentalFee / 2); // Refund half of the fee

        emit CarReturned(carId, msg.sender, rentalFee);
    }

    function getCarDetails(
        uint carId
    ) external view carExists(carId) returns (string memory, uint, CarStatus) {
        Car memory car = cars[carId];
        return (car.model, car.dailyRate, car.status);
    }
}
