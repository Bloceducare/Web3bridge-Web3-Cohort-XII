// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract FoodOrdering{

    struct OrderDetails{
        uint id;
        string name;
        bool ordered;
        uint price;             
        address customerAddress;  
        uint quantity;            
    }

    address owner;

    mapping(uint256 => bool) public updated;

     OrderDetails[] public details;

    constructor (address _owner){
        owner = _owner;
    }

    modifier onlyOwner(){
        require (msg.sender != address(0), "Address not 0 not allowed");
        require(msg.sender == owner, "Oga no be you get am!");
        _;
    }

    function createOrder (uint256 _id, string memory _name, uint256 _price, address _customerAddress) public onlyOwner{
        details.push(OrderDetails(_id, _name, false, _price, _customerAddress, 0));
        
    }

    function confirmOrder (uint256 id) public onlyOwner{
        OrderDetails storage confirmOrders = details[id];
        confirmOrders.ordered = true;
        confirmOrders.quantity += 1;
    }

    function updateOrder (uint256 id, string memory updateFood, uint256 updatePrice, uint256 updateQuantity) public onlyOwner{
        OrderDetails storage confirmOrders = details[id];
        confirmOrders.name = updateFood;
        confirmOrders.price = updatePrice;
        confirmOrders.quantity = updateQuantity;
        updated[id] =  true;
    }

}