// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./Koko.sol";
import "./Kokonft.sol";

contract PiggyBank {

    Suspect public token;
    SuspectNFT public nft;

    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public contributionCount;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;

    event Contributed(
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn(
        uint256 amount,
        uint256 time
    );

    event NFTMinted(
        address indexed Recipient,
        uint256 tokenId,
        uint256 time
    );

    constructor(
        uint256 _targetAmount,
        uint256 _withdrawalDate,
        address _manager,
        address _tokenAddress,
        address _nftAddress
    ) {
        require(_withdrawalDate > block.timestamp, "WITHDRAWAL MUST BE IN FUTURE");

        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        token = Suspect(_tokenAddress);
        nft = SuspectNFT(_nftAddress);
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    function save(uint256 amount) external {
        require(msg.sender != address(0), "UNAUTHORIZED ADDRESS");
        require(block.timestamp <= withdrawalDate, "YOU CAN NO LONGER SAVE");
        require(amount > 0, "YOU ARE BROKE");

        bool receipt = token.transferFrom(msg.sender, address(this), amount);
        require(receipt, "Failed to Transfer tokens");

        if (contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }

        contributions[msg.sender] += amount;
        contributionCount[msg.sender] += 1;

        if (contributionCount[msg.sender] >= 2) { 
            uint256 newTokenId = nft.safeMint(msg.sender);
            emit NFTMinted(msg.sender, newTokenId, block.timestamp);
            }
            
        emit Contributed(msg.sender, amount, block.timestamp);
    }

    function withdrawal() external onlyManager {
        require(block.timestamp >= withdrawalDate, "NOT YET TIME");

        uint256 _contractBal = token.balanceOf(address(this));
        require(_contractBal > 0, "No funds to withdraw");

        require(token.transfer(manager, _contractBal), "Withdrawal Failed");

        emit Withdrawn(_contractBal, block.timestamp);
    }
}
