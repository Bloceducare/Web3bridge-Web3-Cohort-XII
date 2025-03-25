// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";

contract TicketNFT is ERC721URIStorage, Ownable {
    uint private ticketIdCounter;
    uint256 public ticketPrice;
    address public factoryAddress;
    address public organizerAddress;
    uint256 public maxTicketPerUser;
    mapping(address => uint256) public ticketsMinted;
    string public freeTicketSVG;
    string public paidTicketSVG;

    constructor(
        address _factoryAddress,
        string memory _name,
        string memory _symbol,
        uint256 _ticketPrice,
        uint256 _maxTicketPerUser,
        address _organizerAddress,
        string memory _freeTicketSVG,
        string memory _paidTicketSVG
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        ticketPrice = _ticketPrice;
        factoryAddress = _factoryAddress;
        maxTicketPerUser = _maxTicketPerUser;
        organizerAddress = _organizerAddress;
        freeTicketSVG = _freeTicketSVG;
        paidTicketSVG = _paidTicketSVG;
    }

    function mint(address _to) external payable {
        require(ticketsMinted[_to] < maxTicketPerUser, "Limit reached");
        if (ticketPrice > 0) {
            require(msg.value >= ticketPrice, "INSUFFICIENT BALANCE");
        }

        ticketIdCounter++;
        uint256 newTokenId = ticketIdCounter;

        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, generateTokenURI(newTokenId));

        if (ticketPrice > 0) {
            payable(organizerAddress).transfer(msg.value);
        }
    }

    function generateTokenURI(uint256 tokenId) public view returns (string memory) {
        string memory svg = ticketPrice > 0 ? paidTicketSVG : freeTicketSVG;
        string memory imageURI = string(
            abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(svg)))
        );

        string memory json = string(
            abi.encodePacked(
                '{"name": "Event Ticket #',
                Strings.toString(tokenId),
                '", "description": "A ticket for an exclusive event.", "image": "',
                imageURI,
                '"}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
}