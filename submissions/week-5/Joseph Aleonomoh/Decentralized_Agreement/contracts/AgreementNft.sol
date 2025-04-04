// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;


import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AgreementNft is ERC721, Ownable {


    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender)  {
    }

    function mint(address _to, uint256 _value) external returns(bool) {
        _mint(_to, _value);
        return true;
    }

    function transfer(address _to, uint256 _value) external returns(bool) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

}