// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurERC20 is ERC20 {
    address owner;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        owner = msg.sender;
        _mint(owner, 10e18);
    }

   modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
}

}