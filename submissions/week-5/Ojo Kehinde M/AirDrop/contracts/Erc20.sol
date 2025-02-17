// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Cohort XII Token", "CXII") {
        _mint(msg.sender, 10000000 * 10**18); 
    }

    function mint(address _to, uint256 _value) external returns (bool) {
        _mint(_to, _value);
        return true;
    }
}
