// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop is Ownable {
    IERC20 public token;
    uint256 public rewardAmount = 100 * 10**18; // 100 tokens per claim
    mapping(address => bool) public hasClaimed;
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public taskCompletions;

    event AirdropClaimed(address indexed user, uint256 amount);
    event TaskCompleted(address indexed user, uint256 taskId);
    event Whitelisted(address indexed user);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function addToWhitelist(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = true;
            emit Whitelisted(users[i]);
        }
    }

    function completeTask(uint256 taskId) external {
        require(taskId > 0 && taskId <= 3, "Invalid task ID");
        taskCompletions[msg.sender]++;
        emit TaskCompleted(msg.sender, taskId);
    }

    function claimAirdrop() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        
        // Check if user is whitelisted or has completed tasks
        bool canClaim = whitelist[msg.sender] || taskCompletions[msg.sender] >= 3;
        require(canClaim, "Not eligible for airdrop");

        hasClaimed[msg.sender] = true;
        require(token.transfer(msg.sender, rewardAmount), "Transfer failed");
        
        emit AirdropClaimed(msg.sender, rewardAmount);
    }

    function checkBalance(address user) external view returns (uint256) {
        return token.balanceOf(user);
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Transfer failed");
    }

    function setRewardAmount(uint256 newAmount) external onlyOwner {
        rewardAmount = newAmount;
    }
}