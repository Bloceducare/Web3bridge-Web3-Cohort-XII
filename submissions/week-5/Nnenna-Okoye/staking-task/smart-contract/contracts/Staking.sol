// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    constructor() ERC20("Mock Token", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1M tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}