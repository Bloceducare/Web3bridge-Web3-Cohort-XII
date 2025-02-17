// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable{

    constructor() ERC20("LEO TOKEN", "LTK") Ownable(msg.sender) {

    }

    function mint(address _to, uint256 _value) public {
        _mint(_to, _value);
    }

}