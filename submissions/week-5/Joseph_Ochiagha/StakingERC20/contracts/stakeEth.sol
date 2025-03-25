// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract StakingEth {
    uint256 public constant rewardRate = 5; // 5% reward

    uint256 public constant stakingDuration = 30 days;

    struct StakerDetails {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => StakerDetails) public Stakes;

    bool private locked;

    event JustStaked(address indexed staker, uint256 amount);

    event ClaimedReward(address indexed staker, uint256 reward);

    event Withdrawn(address indexed staker, uint256 amount);

    event EmergencyWithdraw(address indexed staker, uint256 amount);

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    function stake() external payable noReentrant {
        require(msg.sender != address(0), "Cannot stake from a zero address");

        require(msg.value > 0, "Cannot deposit zero");

        require(Stakes[msg.sender].amount == 0, "You have already staked");

        Stakes[msg.sender] = StakerDetails(msg.value, block.timestamp);

        emit JustStaked(msg.sender, msg.value);
    }

    function withdraw() external noReentrant {
        StakerDetails memory stakeInfo = Stakes[msg.sender];

        require(stakeInfo.amount > 0, "No stake found");

        require(
            block.timestamp >= stakeInfo.timestamp + stakingDuration,
            "Staking period not ended"
        );

        uint256 reward = (stakeInfo.amount * rewardRate) / 100; // Reward calculation

        uint256 payout = stakeInfo.amount + reward; // Total amount to be paid out

        delete Stakes[msg.sender]; // Remove the stake record

        payable(msg.sender).transfer(payout); // Transfer the payout to the user

        emit Withdrawn(msg.sender, payout);
    }

    function emergencyWithdraw() external noReentrant {
        StakerDetails memory stakeInfo = Stakes[msg.sender];

        require(stakeInfo.amount > 0, "No stake found");

        uint256 payout = stakeInfo.amount; // No reward in case of emergency withdrawal

        delete Stakes[msg.sender]; // Remove the stake record

        payable(msg.sender).transfer(payout); // Transfer the original stake back to the user

        emit EmergencyWithdraw(msg.sender, payout);
    }
}
