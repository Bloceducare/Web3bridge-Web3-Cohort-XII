// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;


contract CarDealer {
    struct Car {
        uint id;
        string name;
        string model;
        uint year;
        uint mileage;
        bool sold;
    }

    address owner;
    uint car_num;
    Car car;
    mapping (address => bool) staffs;
    mapping (uint => Car) public cars;
    

    constructor() {
        owner = msg.sender;
        staffs[owner] = true;
    } 

    modifier onlyOwner(){
        require(msg.sender == owner, "user not owner!!!");
        _;
    }

    modifier onlyStaff(address _address) {
        require(staffs[_address] == true, "user not a staff!!!");
        _;
    }

    function addCar(string memory _name, string memory _model, uint _year, uint _mileage) public onlyStaff(msg.sender) {
        car_num += 1;
        car = Car({id:car_num, name:_name, model:_model, year:_year, mileage:_mileage, sold:false});
        cars[car_num] = car;
    }

    function getCar(uint _id) public view returns (Car memory) {
        return cars[_id];
    }
    

    function sellCar(uint _id) public onlyStaff(msg.sender) returns (Car memory) {
        require(cars[_id].sold == false, "Car has been sold");
        cars[_id].sold = true;
        return cars[_id];
    }

    function addStaff(address _address) public onlyOwner {
        require(_address != address(0));
        require(staffs[_address] == false, "staff already exist");
        staffs[_address] = true;
    }

    function removeStaff(address _address) public onlyOwner {
        require(_address != address(0));
        require(staffs[_address] == true, "staff already removed");
        staffs[_address] = false;
    }

}
