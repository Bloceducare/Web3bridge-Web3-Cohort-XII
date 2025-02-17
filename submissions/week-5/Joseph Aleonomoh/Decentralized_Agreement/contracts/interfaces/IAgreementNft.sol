// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;


import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IAgreementNft is IERC721 {
    function mint(address _to, uint256 _value) external returns(bool);
    function transfer(address _to, uint256 _value) external returns(bool);
}