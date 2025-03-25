// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Auction.sol";

contract AuctionFactory {
    address public admin;
    address[] public auctions;

    event AuctionCreated(address indexed auction, string itemName, uint256 initialPrice, address seller);

    constructor() {
        admin = msg.sender;
    }

    function createAuction(
        string memory itemName,
        uint256 initialPrice,
        uint256 endTime
    ) external {
        require(block.timestamp < endTime, "End time must be in the future");
        Auction newAuction = new Auction(itemName, initialPrice, msg.sender, endTime);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), itemName, initialPrice, msg.sender);
    }

    function getAuctions() external view returns (address[] memory) {
        return auctions;
    }
}
