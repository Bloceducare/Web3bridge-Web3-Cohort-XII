// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract MockERC20 is ERC20 {
//     constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
//         _mint(msg.sender, initialSupply);
//     }
// }


// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("MockToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1,000,000 tokens to deployer
    }
}
