// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Auction {
    address public seller;
    string public item;
    uint256 public endTime;
    uint256 public highestBid;
    address public highestBidder;
    uint256 public contractBalance;
    
    event NewBid(address indexed bidder, uint256 amount);
    event Refund(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this");
        _;
    }

    modifier onlyActiveAuction() {
        require(block.timestamp < endTime, "Auction has ended");
        _;
    }

    constructor(
        string memory _item,
        uint256 _startingPrice,
        address _seller,
        uint256 _endTime
    ) {
        seller = _seller;
        item = _item;
        highestBid = _startingPrice;
        endTime = _endTime;
        contractBalance = 0;
    }

    function placeBid() external payable onlyActiveAuction {
        require(msg.value > 0, "Bid must be greater than zero");

        uint256 minRequiredBid = getMinimumBid();
        require(msg.value >= minRequiredBid, "Bid too low");

        if (highestBidder != address(0)) {
            uint256 refundAmount = highestBid + ((msg.value - highestBid) / 10);
            payable(highestBidder).transfer(refundAmount);
            emit Refund(highestBidder, refundAmount);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        contractBalance += (msg.value - highestBid) + (highestBid / 10);

        emit NewBid(msg.sender, msg.value);
    }

    function withdraw() external onlySeller {
        require(block.timestamp >= endTime, "Auction not yet ended");
        require(contractBalance > 0, "Nothing to withdraw");

        uint256 amount = contractBalance;
        contractBalance = 0;
        payable(seller).transfer(amount);
        emit AuctionEnded(highestBidder, amount);
    }

    function getMinimumBid() public view returns (uint256) {
        uint256 minRequiredBid = contractBalance + (highestBid - contractBalance) + (highestBid / 10);
        return minRequiredBid;
    }
}
