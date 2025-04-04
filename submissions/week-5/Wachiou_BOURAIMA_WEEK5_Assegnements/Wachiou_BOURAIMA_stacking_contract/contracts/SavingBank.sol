// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SavingBank {
    // costumes errors

    error unauthorized();
    error InsufficientBalance(uint256 available, uint256 required);
    error WithdrawNotAllowed(uint256 withdrawDate);
    error DepositAmountShouldBeGreaterThanZero();
    // end costumes errors

    address public manager;
    uint256 public balance;
    uint256 public depositCount;
    uint256 public withdrawCount;
    uint256 public totalDeposits;
    uint256 public totalWithdraws;
    uint256 public totalInterest;
    uint256 public totalCustomers;
    uint8 public constant INTEREST_RATE = 5;
    IERC20 public token;

    mapping(address => uint256) public withdrawDate;

    constructor(IERC20 _token) {
        manager = msg.sender;
        token = _token;

    }

    struct Customer {
        address customerAddress;
        uint256 balance;
        uint256 depositCount;
        uint256 withdrawCount;
        uint256 totalDeposits;
        uint256 totalWithdraws;
        uint256 totalInterest;
    }

    mapping(address => Customer) public customers;

    event Deposit(address indexed customer, uint256 amount);
    event Withdraw(address indexed customer, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    function deposit(uint256 _amount) public {
        address customer = msg.sender;
        Customer memory _customer = customers[msg.sender];

        if (_amount <= 0) {
            revert DepositAmountShouldBeGreaterThanZero();
        }
        if (customer == manager) {
            revert unauthorized();
        }
        if (customers[customer].customerAddress == address(0)) {
            _customer = Customer(msg.sender, 0, 0, 0, 0, 0, 0);
            totalCustomers++;
        }

        token.transferFrom(customer, address(this), _amount);

        _customer.balance += _amount;
        _customer.depositCount++;
        _customer.totalDeposits += _amount;
        totalDeposits += _amount;
        balance += _amount;
        withdrawDate[customer] = block.timestamp + 30 days;

        emit Deposit(customer, _amount);
    }

    function claimInterest() public {
        Customer memory _customer = customers[msg.sender];

        if (_customer.customerAddress == address(0)) {
            revert unauthorized();
        } else {
            if (withdrawDate[msg.sender] > block.timestamp) {
                revert WithdrawNotAllowed(withdrawDate[msg.sender]);
            }
            uint256 interest = (_customer.balance * INTEREST_RATE) / 100;
            _customer.balance += interest;
            _customer.totalInterest += interest;
            totalInterest += interest;
            balance += interest;

            emit Transfer(manager, msg.sender, interest);
        }
    }

    function withdraw(uint256 amount) public {
        Customer storage _customer = customers[msg.sender];

        if (_customer.customerAddress != address(0)) {
            revert unauthorized();
        } else {
            if (withdrawDate[msg.sender] > block.timestamp) {
                revert WithdrawNotAllowed(withdrawDate[msg.sender]);
            } else {
                _customer.balance -= amount;
                _customer.withdrawCount++;
                _customer.totalWithdraws += amount;
                totalWithdraws += amount;
                balance -= amount;

                token.transfer(msg.sender, amount);
                emit Withdraw(msg.sender, amount);
            }
            if (_customer.balance < amount) {
                revert InsufficientBalance(_customer.balance, amount);
            }
        }
    }
}
