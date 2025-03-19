// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion tokens with 18 decimals
    
    constructor() 
        ERC20("Idealz Token", "IDE")
        Ownable(msg.sender)
    {
        // Mint initial supply to owner
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    // Function to allow owner to mint new tokens (if needed)
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    // Function to recover tokens accidentally sent to contract
    function recoverTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), amount);
    }
    
    // Function to recover ETH accidentally sent to contract
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}