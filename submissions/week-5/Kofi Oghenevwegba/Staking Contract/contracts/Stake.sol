// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 

contract StakeERC20 {
    IERC20 public stakingToken;
    uint private constant REWARD_RATE = 10;
    uint private constant SECONDS_IN_30_DAYS = 30 * 24 * 60 * 60;

    struct Stake {
        uint amount;
        uint stakeTime;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint amount);
    event Withdrawn(address indexed user, uint amount, uint reward);

    constructor(IERC20 _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from the user to the contract
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        
        // Record the staking information
        stakes[msg.sender] = Stake({
            amount: _amount,
            stakeTime: block.timestamp
        });

        emit Staked(msg.sender, _amount);
    }

    function _calculateReward(address _staker) private view returns (uint) {
        Stake memory userStake = stakes[_staker];
        uint duration = block.timestamp - userStake.stakeTime;

        uint reward = (userStake.amount * REWARD_RATE * duration) / (SECONDS_IN_30_DAYS * 100);

        return reward;
    }

    function withdraw() external {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No tokens staked");

        uint reward = _calculateReward(msg.sender);
        uint totalAmount = userStake.amount + reward;

        // Reset the user's stake
        stakes[msg.sender] = Stake({ amount: 0, stakeTime: 0 });

        // Transfer staked amount and reward back to the user
        stakingToken.transfer(msg.sender, totalAmount);

        emit Withdrawn(msg.sender, userStake.amount, reward);
    }
}