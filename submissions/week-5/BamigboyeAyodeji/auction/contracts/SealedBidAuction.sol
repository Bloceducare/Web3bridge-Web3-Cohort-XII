// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SealedBidAuction {
    IERC20 public token;
    address public owner;

    struct Auction {
        address seller;
        uint256 item;
        uint256 minimumBid;
        uint256 startTime;
        uint256 endTime;
        uint256 revealDeadline;
        address highestBidder;
        uint256 highestBid;
        bool isAuctionFinalized;
        bool auctionEnded;
        address[] bidders;
        mapping(address => bytes32) bids;
        mapping(address => uint256) revealedBids;
        mapping(address => uint256) deposits;
    }
    
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCounter;

    error NotSeller();
    error TimeOver();
    error MinimumDepositNotReached();
    error NotInRevealPhase();
    error NoBidSubmitted();
    error InvalidBidReveal();
    error RevealPhaseNotOver();
    error WinnerAlreadyChosen();
    error AuctionNotYetCompleted();
    error AuctionAlreadyClosed();
    
    event AuctionCreated(uint256 auctionId, address seller, uint256 item, uint256 minimumBid, uint256 endTime);
    event BidSubmitted(uint256 auctionId, address bidder);
    event BidRevealed(uint256 auctionId, address bidder, uint256 bidAmount);
    event AuctionFinalized(uint256 auctionId, address winner, uint256 highestBid);

    modifier OnlySeller() {
        if (owner != msg.sender) revert NotSeller();
        _;
    }

    constructor(IERC20 _token) {
        owner = msg.sender;
        token = _token;
    }

    function createAuction(uint256 _item, uint256 _minimumBid, uint256 _biddingTime, uint256 _revealTime) external {
        auctionCounter++;
        Auction storage auction = auctions[auctionCounter];
        auction.seller = msg.sender;
        auction.item = _item;
        auction.minimumBid = _minimumBid;
        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + _biddingTime;
        auction.revealDeadline = auction.endTime + _revealTime;
        
        emit AuctionCreated(auctionCounter, msg.sender, _item, _minimumBid, auction.endTime);
    }

    function submitBid(uint256 _auctionId, bytes32 _bidHash, uint256 _deposit) external {
        Auction storage auction = auctions[_auctionId];
        if (block.timestamp > auction.endTime) revert TimeOver();
        if (_deposit < auction.minimumBid) revert MinimumDepositNotReached();
        
        token.transferFrom(msg.sender, address(this), _deposit);
        auction.bids[msg.sender] = _bidHash;
        auction.deposits[msg.sender] = _deposit;
        auction.bidders.push(msg.sender);
        
        emit BidSubmitted(_auctionId, msg.sender);
    }

    function revealBid(uint256 _auctionId, uint256 _bidAmount, string memory _secret) external {
        Auction storage auction = auctions[_auctionId];
        if (block.timestamp < auction.endTime || block.timestamp > auction.revealDeadline) revert NotInRevealPhase();
        if (auction.bids[msg.sender] == bytes32(0)) revert NoBidSubmitted();
        
        bytes32 computedHash = keccak256(abi.encodePacked(_bidAmount, _secret));
        if (computedHash != auction.bids[msg.sender]) revert InvalidBidReveal();
        
        auction.revealedBids[msg.sender] = _bidAmount;
        
        emit BidRevealed(_auctionId, msg.sender, _bidAmount);
    }

    function determineWinner(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        if (block.timestamp < auction.revealDeadline) revert RevealPhaseNotOver();
        if (auction.auctionEnded) revert WinnerAlreadyChosen();
        
        address highestBidder;
        uint256 highestBid;
        
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            address bidder = auction.bidders[i];
            uint256 bidAmount = auction.revealedBids[bidder];
            if (bidAmount > highestBid) {
                highestBid = bidAmount;
                highestBidder = bidder;
            }
        }
        
        auction.highestBidder = highestBidder;
        auction.highestBid = highestBid;
        auction.auctionEnded = true;
    }

    function finalizeAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        if (!auction.auctionEnded) revert AuctionNotYetCompleted();
        if (auction.isAuctionFinalized) revert AuctionAlreadyClosed();
        
        if (auction.highestBid > 0) {
            token.transfer(auction.seller, auction.highestBid);
        }
        auction.isAuctionFinalized = true;
        
        emit AuctionFinalized(_auctionId, auction.highestBidder, auction.highestBid);
    }
}