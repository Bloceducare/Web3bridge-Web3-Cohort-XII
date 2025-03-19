// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";

// savings in erc20token
// owner can deposit and withdraw
// owner can't withdraw before unlockTime

interface IDmysticalNFT is IERC721 {
    function awardNft(address contributor) external;
    
}

contract Piggy {
    // state variables
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;
    IERC20 dmy;
    mapping(address => uint256) vvip;
    mapping(address => bool) isMinted;
    IDmysticalNFT DNFT; 
    

    // events
    event Contributed (
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn (
        uint256 amount,
        uint256 time
    );

    // constructor
    constructor (uint256 _targetAmount, uint256 _withdrawalDate, address _manager, address erc20TokenAddress, address erc721TokenAddress) {
        require(_withdrawalDate > block.timestamp, 'WITHDRAWAL MUST BE IN FUTURE');
        
        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        dmy = IERC20(erc20TokenAddress);
        DNFT = IDmysticalNFT(erc721TokenAddress);

    }

    modifier onlyManager () {
        require(msg.sender == manager, 'YOU WAN THIEF ABI ?');
        _;
    }

    // save
    function save (uint256 _amount) external {
        
        require(msg.sender != address(0), 'UNAUTHORIZED ADDRESS');

        require(block.timestamp <= withdrawalDate, 'YOU CAN NO LONGER SAVE');

        require(_amount > 0, 'YOU ARE BROKE');
        
        bool txn = dmy.transferFrom(msg.sender, address(this), _amount);
        
        require(txn, "Transaction Failed");

        // check if the caller is a first time contributor
        if(contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }
        
        if(vvip[msg.sender] >= 2 && isMinted[msg.sender]  == false) {
            // mint nft
            DNFT.awardNft(msg.sender);

            isMinted[msg.sender] = true;
        }else {
            vvip[msg.sender] += 1;
        }
        
        contributions[msg.sender] += _amount;

        emit Contributed(msg.sender, _amount, block.timestamp);
        
    }

    // withdrawal
    function withdrawal () external onlyManager {
        // require that its withdrawal time or greater
        require(block.timestamp >= withdrawalDate, 'NOT YET TIME');
        
        uint256 _contractBalance =  dmy.balanceOf(address(this));

        // require contract bal is > or = targetAmount
        require(_contractBalance >= targetAmount, 'TARGET AMOUNT NOT REACHED');
        
        bool txn = dmy.transfer(manager, _contractBalance);
        
        require(txn, "Transaction Failed");

        emit Withdrawn(_contractBalance, block.timestamp);
    }

    function getBalance() public view returns(uint256) {
         return dmy.balanceOf(address(this));
    }

    function geterc721Balance(address _address) public view returns (uint256) {
        return DNFT.balanceOf(_address);
    }
}

