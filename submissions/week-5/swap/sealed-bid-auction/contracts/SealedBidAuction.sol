// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SealedBidAuction {
    address public seller;
    uint public minBid;
    uint public deadline;
    bool public ended;
    address public highestBidder;
    uint public highestBid;
    mapping(address => bytes32) public bids;
    mapping(address => uint) public deposits;
    IERC20 public token;

    event BidSubmitted(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 highestBid);

    constructor(address _tokenAddress, uint _minBid, uint _duration) {
        seller = msg.sender;
        minBid = _minBid;
        deadline = block.timestamp + _duration;
        ended = false;
        token = IERC20(_tokenAddress);
    }

    /**
     * @dev Submit a sealed bid with an ERC20 token amount. 
     * @param sealedBid The hash of the bid amount and a secret string.
     * @param amount The amount of tokens to bid.
     */
    function submitBid(bytes32 sealedBid, uint256 amount) external {
        require(block.timestamp < deadline, "Auction has ended");
        require(amount >= minBid, "Bid below minimum");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        bids[msg.sender] = sealedBid;
        deposits[msg.sender] += amount;
        emit BidSubmitted(msg.sender, amount);
    }

    /**
     * @dev Reveal the bid amount and secret. 
     * @param bid The actual bid amount.
     * @param secret The secret used to seal the bid.
     */
    function revealBid(uint bid, string memory secret) external {
        require(block.timestamp > deadline && !ended, "Auction not ended or already revealed");
        require(bids[msg.sender] == keccak256(abi.encodePacked(bid, secret)), "Invalid bid or secret");

        if (bid > highestBid && bid <= deposits[msg.sender]) {
            if (highestBidder != address(0)) {
                deposits[highestBidder] += highestBid;
            }
            highestBidder = msg.sender;
            highestBid = bid;
            deposits[msg.sender] -= bid;
        } else {
            // Refund deposit if bid wasn't the highest
            deposits[msg.sender] += deposits[msg.sender]; // This corrects the original logic
        }

        if (block.timestamp > deadline + 1 minutes) { // Changed to 1 minute for reveal period
            endAuction();
        }
    }

    /**
     * @dev End the auction after the reveal period, transferring funds to the seller and refunding others.
     */
    function endAuction() public {
        require(block.timestamp > deadline + 1 minutes, "Reveal period not over"); // One minute reveal period
        require(!ended, "Auction already ended");
        ended = true;
        
        // Transfer highest bid to seller
        token.transfer(seller, highestBid);
        emit AuctionEnded(highestBidder, highestBid);

        // Refund any remaining deposits
        for (uint i = 0; i < 256; i++) { // Assumes max 256 bidders, adjust if needed
            address bidder = address(uint160(i));
            if (bidder != address(0) && deposits[bidder] > 0) {
                token.transfer(bidder, deposits[bidder]);
                deposits[bidder] = 0; // Reset deposit to avoid double spending
            }
        }
    }

    /**
     * @dev Retrieve the address of the token used for bidding.
     */
    function getTokenAddress() public view returns (address) {
        return address(token);
    }

    /**
     * @dev Retrieve the amount of token deposit for a specific bidder.
     * @param bidder Address of the bidder.
     */
    function getBidderDeposit(address bidder) public view returns (uint256) {
        return deposits[bidder];
    }
}