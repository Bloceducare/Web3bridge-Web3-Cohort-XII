// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StakeCoin is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("StakeCoin", "STC") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 18; // overridding 18 decimals
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
}
