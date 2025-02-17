// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract XiTK is ERC20, Ownable {
    constructor() ERC20("cohort xii Token", "CXII") Ownable(msg.sender) {}

    function mint(address _to, uint256 _value) external onlyOwner returns (bool) {
        _mint(_to, _value);
        return true;
    }
}
