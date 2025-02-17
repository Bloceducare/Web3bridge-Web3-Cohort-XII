// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    IERC20 public token;

    uint256 public constant REWARD_RATE = 10; // 10% annual reward rate
    uint256 public constant MIN_STAKING_DURATION = 7 days; // 7 days minimum staking period

    struct Stake {
        uint256 amount;
        uint256 stakedAt;
    }

    mapping(address => Stake) public stakes;

    // Custom reentrancy guard
    bool private locked;

    modifier noReentrancy() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event Staked(address indexed user, uint256 amount, uint256 stakedAt);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    event Airdropped(address indexed user, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function stake(uint256 amount) external noReentrancy {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer tokens from user to contract
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Update or create the user's stake
        stakes[msg.sender] = Stake({
            amount: stakes[msg.sender].amount + amount,
            stakedAt: block.timestamp
        });

        emit Staked(msg.sender, amount, block.timestamp);
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.stakedAt;
        uint256 reward = (userStake.amount * REWARD_RATE * stakingDuration) / (365 days * 100);

        return reward;
    }

    function withdraw() external noReentrancy {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");

        uint256 stakingDuration = block.timestamp - userStake.stakedAt;
        require(stakingDuration >= MIN_STAKING_DURATION, "Minimum staking duration not met");

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        // Reset user's stake
        delete stakes[msg.sender];

        // Transfer tokens back to the user
        require(token.transfer(msg.sender, totalAmount), "Transfer failed");

        emit Withdrawn(msg.sender, userStake.amount, reward);
    }

    function airdropTokens(address[] calldata recipients, uint256[] calldata amounts) external noReentrancy {
        require(recipients.length == amounts.length, "Arrays must be of equal length");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transferFrom(msg.sender, recipients[i], amounts[i]), "Transfer failed");
            emit Airdropped(recipients[i], amounts[i]);
        }
    }
}
