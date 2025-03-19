// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// The AJO contract is a decentralized savings system where users can contribute ERC-20 tokens (CXII) and earn an NFT 
//if they contribute multiple times. The manager can withdraw funds once the savings target and deadline are met.

interface IAjoERC721 is IERC721 {
    function mint(address _to) external;
}

contract AJO {
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;
    IERC20 public immutable cxii;
    IAjoERC721 public immutable nftContract;
    mapping(address => uint256) private vvip;
    mapping(address => bool) public isMinted;

    // Events
    event Contributed(address indexed contributor, uint256 amount, uint256 time);
    event Withdrawn(uint256 amount, uint256 time);

    constructor(
        uint256 _targetAmount,
        uint256 _withdrawalDate,
        address _manager,
        address _erc20Token,
        address _erc721Token
    ) {
        require(_withdrawalDate > block.timestamp, "Withdrawal date must be in the future");
        require(_manager != address(0), "Manager address cannot be zero");
        require(_erc20Token != address(0), "ERC20 token address cannot be zero");
        require(_erc721Token != address(0), "ERC721 token address cannot be zero");

        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        cxii = IERC20(_erc20Token);
        nftContract = IAjoERC721(_erc721Token);
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Unauthorized: Only manager can perform this action");
        _;
    }

    function save(uint256 _amount) external {
        require(msg.sender != address(0), "Unauthorized address");
        require(block.timestamp <= withdrawalDate, "You can no longer save");
        require(_amount > 0, "Deposit amount must be greater than zero");

        //ensure user has approved enough tokens before transfer
        require(cxii.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");

        //transfer token to the contract
        bool txn = cxii.transferFrom(msg.sender, address(this), _amount);
        require(txn, "Transaction failed");

        //first-time contributor check
        if (contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }

        //increase user's vvip count before checking minting condition
        vvip[msg.sender] += 1;

        //mint NFT if user qualifies
        if (vvip[msg.sender] >= 2 && !isMinted[msg.sender]) {
            nftContract.mint(msg.sender); 
            isMinted[msg.sender] = true;
        }


        contributions[msg.sender] += _amount;
        emit Contributed(msg.sender, _amount, block.timestamp);
    }

    function withdrawal() external onlyManager {
        require(block.timestamp >= withdrawalDate, "Not yet time for withdrawal");

        uint256 _contractBalance = cxii.balanceOf(address(this));
        require(_contractBalance >= targetAmount, "Target amount not reached");

        bool txn = cxii.transfer(manager, _contractBalance);
        require(txn, "Transaction failed");

        emit Withdrawn(_contractBalance, block.timestamp);
    }
}
