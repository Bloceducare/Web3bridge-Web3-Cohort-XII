// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingApp {
    IERC20 public token;
    address public owner;
    uint public rewardRatePerSecond = 1e16; // Example: 0.01 tokens per second (adjust as needed)

    struct AccountDetails {
        address accountAddr;
        uint deadline;
        uint amount;
        uint depositTime;
        string name;
    }

    mapping(address => AccountDetails) private Staked;
    address[] private addressList;

    event AccountCreated(address indexed user, string name, uint deadline);
    event TokensDeposited(address indexed user, uint amount);
    event TokensWithdrawn(address indexed user, uint amount, uint reward);

    constructor(address _tokenAddress) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
    }

    function creatingAccount(uint _deadline, string memory _name) public {
        require(Staked[msg.sender].accountAddr == address(0), "Account already exists");

        Staked[msg.sender] = AccountDetails({
            accountAddr: msg.sender,
            amount: 0,
            depositTime: 0, // Not deposited yet
            name: _name,
            deadline: _deadline
        });

        addressList.push(msg.sender);
        emit AccountCreated(msg.sender, _name, _deadline);
    }

    function depositAccount(uint _amount) external {
        require(_amount > 0, "Deposit must be greater than 0");
        require(Staked[msg.sender].accountAddr != address(0), "Account does not exist");

        // Ensure the contract is approved to spend the tokens
        require(token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");

        // Transfer tokens from sender to staking contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        if (Staked[msg.sender].amount == 0) {
            Staked[msg.sender].depositTime = block.timestamp; // Set first deposit time
        }

        Staked[msg.sender].amount += _amount;

        emit TokensDeposited(msg.sender, _amount);
    }

    function calculateRewards(address _staker) public view returns (uint) {
        AccountDetails memory account = Staked[_staker];

        if (account.amount == 0 || account.depositTime == 0) {
            return 0;
        }

        uint stakingDuration = block.timestamp - account.depositTime; // Time staked
        uint reward = stakingDuration * rewardRatePerSecond;

        return reward;
    }

    function withdraw() external {
        require(Staked[msg.sender].accountAddr != address(0), "Account does not exist");
        require(block.timestamp >= Staked[msg.sender].deadline, "Cannot withdraw before deadline");
        require(Staked[msg.sender].amount > 0, "No funds available to withdraw");

        uint reward = calculateRewards(msg.sender);
        uint amountToWithdraw = Staked[msg.sender].amount + reward;

        Staked[msg.sender].amount = 0;
        Staked[msg.sender].depositTime = 0;

        require(token.transfer(msg.sender, amountToWithdraw), "Token transfer failed");

        emit TokensWithdrawn(msg.sender, amountToWithdraw, reward);
    }

    function getAnAccount(address _address) public view returns (AccountDetails memory) {
        return Staked[_address];
    }
}
