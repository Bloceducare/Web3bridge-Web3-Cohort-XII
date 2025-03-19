// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MayToken is ERC20, Ownable {
    
    event Burn(address indexed from, uint256 value);
    event Mint(address indexed to, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) 
        ERC20(_name, _symbol) Ownable(msg.sender)
    {
        _mint(msg.sender, _initialSupply * 10 ** uint256(decimals()));
    }

    
    function burn(uint256 _value) public returns (bool success) {
        _burn(msg.sender, _value);
        emit Burn(msg.sender, _value);
        return true;
    }

    
    function mint(address _to, uint256 _value) public onlyOwner returns (bool success) {
        _mint(_to, _value);
        emit Mint(_to, _value);
        return true;
    }
}


