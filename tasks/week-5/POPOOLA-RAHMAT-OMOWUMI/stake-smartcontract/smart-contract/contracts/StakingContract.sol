// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingContract {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Custom Errors
    error ZeroAddress();
    error InsufficientBalance(uint256 requested, uint256 available);
    error StakingPeriodNotMet(uint256 requiredTime, uint256 currentTime);
    error Unauthorized();
    error ReentrancyGuard();
    error InvalidAmount();

    // State variables
    IERC20 public immutable token;
    address public immutable owner;
    uint256 public immutable minStakingPeriod;
    uint256 public constant REWARD_RATE = 10; // 10% reward per staking period

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => bool) private isStaking;
    
    bool private locked;

    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(IERC20 _token, uint256 _minStakingPeriod) {
        if (address(_token) == address(0)) revert ZeroAddress();
        owner = msg.sender;
        token = _token;
        minStakingPeriod = _minStakingPeriod;
    }

    modifier noReentrant() {
        if (locked) revert ReentrancyGuard();
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function stake(uint256 amount) external noReentrant {
        if (amount == 0) revert InvalidAmount();
        if (token.balanceOf(msg.sender) < amount) revert InsufficientBalance(amount, token.balanceOf(msg.sender));
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        stakedAmount[msg.sender] = stakedAmount[msg.sender].add(amount);
        stakingTimestamp[msg.sender] = block.timestamp;
        isStaking[msg.sender] = true;

        emit TokensStaked(msg.sender, amount);
    }

    function unstake() external noReentrant {
        if (!isStaking[msg.sender]) revert InvalidAmount();
        if (block.timestamp < stakingTimestamp[msg.sender] + minStakingPeriod) {
            revert StakingPeriodNotMet(stakingTimestamp[msg.sender] + minStakingPeriod, block.timestamp);
        }

        uint256 amount = stakedAmount[msg.sender];
        uint256 reward = calculateReward(msg.sender);
        stakedAmount[msg.sender] = 0;
        isStaking[msg.sender] = false;

        token.safeTransfer(msg.sender, amount.add(reward));
        emit TokensUnstaked(msg.sender, amount, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        if (!isStaking[user]) return 0;
        uint256 stakedTime = block.timestamp.sub(stakingTimestamp[user]);
        uint256 reward = (stakedAmount[user] * REWARD_RATE * stakedTime) / (100 * minStakingPeriod);
        return reward;
    }
}
