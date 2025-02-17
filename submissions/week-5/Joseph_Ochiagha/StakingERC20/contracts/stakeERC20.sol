//SPDX-License-Identifier : UNLICENSED

pragma solidity 0.8.28;

contract stakingRewards {
    IERC20 public immutable StakingToken;
    IERC20 public immutable RewardToken;

    uint256 public constant stakingDuration = 30 days;
    uint256 public constant rewardRate = 5;

    error InvalidAmount();
    error UnAuthorized();
    error TokenAllowanceTooLow();
    error stakingPeriodNotFinished();

    address public owner;

    struct Stake {
        uint256 amount;
        uint256 timeOfStake;
    }

    mapping(address => Stake) public stakes;

    constructor(address _StakingToken, address _RewardToken) {
        StakingToken = IERC20(_StakingToken);
        RewardToken = IERC20(_RewardToken);
        owner = msg.sender;
    }

    //requires the User to stake
    function stakeTokens(uint256 _amount) public {
        if (_amount == 0) {
            revert InvalidAmount();
        }
        // Check if the allowance is sufficient
        if (StakingToken.allowance(msg.sender, address(this)) < _amount) {
            revert TokenAllowanceTooLow();
        }

        StakingToken.transferFrom(msg.sender, address(this), _amount);

        //after transfer approval, update the user's Stake
        stakes[msg.sender] = Stake({
            amount: _amount,
            timeOfStake: block.timestamp
        });
    }

    function withdrawTokens() external {
        Stake memory userStake = stakes[msg.sender];
        //check if the user staked a Token
        if (userStake.amount == 0) {
            revert UnAuthorized();
        }

        //check if the time to withdraw matches with the time the user is requesting withdrawal
        if (block.timestamp <= userStake.amount + stakingDuration) {
            revert stakingPeriodNotFinished();
        }
        // Calculate the reward
        uint256 reward = (userStake.amount * rewardRate) / 100;

        // Send back the staked amount plus the reward
        StakingToken.transfer(msg.sender, userStake.amount + reward);

        // Remove the stake record
        delete stakes[msg.sender];
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}
