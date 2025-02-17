// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CisToken is ERC20, Ownable {
    constructor() ERC20("CisToken", "CIS") Ownable(msg.sender) { 
        //mint 100M tokens to the contract creator
        _mint(msg.sender, 100000000 * 10**decimals());  
    }

    // override decimals if needed
    // function decimals() public pure override returns (uint8) {
    //     return 18;  
    // }

    function mint(uint256 amount) external onlyOwner { 
        _mint(msg.sender, amount);
    }
}
