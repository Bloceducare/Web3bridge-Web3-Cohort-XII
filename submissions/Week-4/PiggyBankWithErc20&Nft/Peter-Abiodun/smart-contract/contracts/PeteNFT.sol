// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PeteNFT is ERC721 {
    constructor() ERC721("Pete", "PETE") {
        _mint(msg.sender, 1);
    }

}
