// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tickets is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address private _eventContract;

    constructor(
        address eventContract,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _eventContract = eventContract;
    }

    modifier onlyEventContract() {
        require(
            msg.sender == _eventContract,
            "Caller is not the event contract"
        );
        _;
    }

    function mintTicket(address to) external onlyEventContract {
        _tokenIdCounter++;
        _safeMint(to, _tokenIdCounter);
    }
}
