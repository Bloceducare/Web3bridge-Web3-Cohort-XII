// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MerkleAirdropToken is ERC20 {
    /**
     * @dev Sets the name and symbol of the token and mints an initial supply to the deployer's address.
     */
    constructor() ERC20("MerkleAirdropToken", "MAT") {
        uint256 initialSupply = 100 * 10**18; // Mint 100 ETH worth of tokens
        _mint(msg.sender, initialSupply);
    }
}