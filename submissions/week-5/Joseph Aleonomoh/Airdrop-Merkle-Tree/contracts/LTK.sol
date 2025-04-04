// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LTK is ERC20 {

    constructor() ERC20("cohort xii Token", "cxii") {

    }

    function mint(address _to, uint256 _value) external returns(bool) {
        _mint(_to, _value);
        return true;
    }

}