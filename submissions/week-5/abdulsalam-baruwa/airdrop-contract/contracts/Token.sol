// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address private owner;
    constructor() ERC20("Dmystical", "DMYL") {
        owner = msg.sender;
        Token.mint(owner, 1000e18);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }

}