// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract IntERC20 is ERC20 {
      address public admin;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        admin = msg.sender;
        _mint(admin, initialSupply);
    }

   function mint(address to, uint256 amount) public {
        if (msg.sender != admin) {
            revert("Only holder is authorised to mint");
        }
        _mint(to, amount);
    }
}