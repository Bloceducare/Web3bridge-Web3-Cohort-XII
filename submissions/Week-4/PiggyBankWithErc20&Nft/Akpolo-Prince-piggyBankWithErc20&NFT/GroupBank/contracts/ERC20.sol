// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the ERC-20 contract from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ourToken is ERC20 {
    // Constructor: This is called when the contract is deployed
    address deployer;
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {

        deployer = msg.sender;
        
        // Mint 1 million tokens and send them to the creator (you)
        _mint(deployer, 1000000 * 10 ** decimals());
    }

   
}
