// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract LandRegistry {

  address public admin;

  struct Land {
    address landOwner;
    uint256 amount;
    uint256 size;
    string place;
    bool isRegistered;
  }

  constructor() {
    admin = msg.sender;
  }

  mapping(uint Land) public lands;
  mapping(address uint[]) public ownerLands;

  modifier onlyOwner() {
    require(msg.sender === admin, 'Not owner');
    _;
  }

  function Register(address _client) public {
    Land storage 
  }


}