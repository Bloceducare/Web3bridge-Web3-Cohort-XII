// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Stores the eventContract address
//mintTicket(): Allows only the event contract to mint a new NFT ticket.
contract Tickets is ERC721Enumerable, Ownable {
    address public eventContract;

    constructor(address _eventContract, string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {
        eventContract = _eventContract;
    }

    function mintTicket(address _to, uint256 _ticketId) external {
        require(msg.sender == eventContract, "ONLY EVENT CONTRACT CAN MINT");
        _safeMint(_to, _ticketId);
    }
}
