// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SavingsContract {
    using SafeERC20 for IERC20;
    
    IERC20 public savingsToken;
    IERC721 public rewardNFT;
    uint256 public nextTokenId;

    struct SavingsPlan {
        uint256 balance;
        uint256 goal;
        uint256 unlockTime;
        uint256 depositCount;
    }

    mapping(address => SavingsPlan) private savings;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event SavingsGoalSet(address indexed user, uint256 goal, uint256 unlockTime);
    event NFTRewarded(address indexed user, uint256 tokenId);

    constructor(address _savingsToken, address _rewardNFT) {
        savingsToken = IERC20(_savingsToken);
        rewardNFT = IERC721(_rewardNFT);
    }

    function setSavingsGoal(uint256 _goal, uint256 _timeInDays) external {
        require(_goal > 0, "Goal must be greater than zero");
        require(_timeInDays > 0, "Time must be greater than zero");
        require(savings[msg.sender].balance == 0, "Cannot change goal after deposit");

        savings[msg.sender].goal = _goal;
        savings[msg.sender].unlockTime = block.timestamp + (_timeInDays * 1 days);

        emit SavingsGoalSet(msg.sender, _goal, savings[msg.sender].unlockTime);
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Deposit amount must be greater than zero");
        
        // Transfer ERC20 token to contract
        savingsToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Update savings balance
        savings[msg.sender].balance += _amount;
        savings[msg.sender].depositCount += 1;

        emit Deposited(msg.sender, _amount);

        // Gift NFT on second deposit
        if (savings[msg.sender].depositCount == 2) {
            require(rewardNFT.ownerOf(nextTokenId) == address(this), "Contract does not own NFT");
            rewardNFT.safeTransferFrom(address(this), msg.sender, nextTokenId);
            emit NFTRewarded(msg.sender, nextTokenId);
            nextTokenId++;
        }
    }

    function withdraw() external {
        SavingsPlan storage userSavings = savings[msg.sender];
        require(block.timestamp >= userSavings.unlockTime, "Funds are locked");
        require(userSavings.balance >= userSavings.goal, "Savings goal not reached");
        require(userSavings.balance > 0, "No funds to withdraw");

        uint256 amount = userSavings.balance;
        userSavings.balance = 0;

        savingsToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getSavingsDetails()
        external
        view
        returns (uint256 balance, uint256 goal, uint256 unlockTime, uint256 depositCount)
    {
        SavingsPlan memory userSavings = savings[msg.sender];
        return (userSavings.balance, userSavings.goal, userSavings.unlockTime, userSavings.depositCount);
    }
}
