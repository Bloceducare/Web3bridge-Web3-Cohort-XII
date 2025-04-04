// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract USDB is ERC20, ERC20Permit, Ownable, Pausable {
    // Custom errors for gas optimization
    error InvalidAmount();
    error BlacklistedAddress();

    // Blacklist mapping for enhanced security
    mapping(address => bool) public isBlacklisted;

    event AddressBlacklisted(address indexed account, bool status);
    event TokensBurned(address indexed from, uint256 amount);

    constructor()
        ERC20("USD BIGEAZI", "USDB")
        ERC20Permit("USD BIGEAZI")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function setBlacklist(address account, bool status) external onlyOwner {
        isBlacklisted[account] = status;
        emit AddressBlacklisted(account, status);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Updated to use _update instead of _beforeTokenTransfer
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        // Check blacklist status before transfer
        if (isBlacklisted[from] || isBlacklisted[to])
            revert BlacklistedAddress();

        // Call parent implementation
        super._update(from, to, amount);
    }

    // Additional security measures
    function recoverERC20(
        address tokenAddress,
        uint256 tokenAmount
    ) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }
}
