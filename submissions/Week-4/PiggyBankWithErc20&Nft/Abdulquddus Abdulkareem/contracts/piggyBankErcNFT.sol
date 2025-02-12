// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28; 

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";

interface contriNFT is IERC721 {
    function contributorNft(address contributor) external;
}

contract piggyBankErcNFT {

     // State variables
     uint256 public targetAmount;
     uint256 public immutable withdrawalDate;
     uint8 public contributorsCount;
     address public manager;
     IERC20 SaveToken;
     contriNFT saveNFT;
     mapping (address => uint256) public contributions;
     mapping (address => bool) public hasReceivedNFT;
     uint256 public nftThreshold = 5 ether; // Minimum savings required to earn an NFT

     // Events
     event Contributed (
          address indexed Contributor,
          uint256 amount,
          uint256 time
     );
    
     event Withdrawn (
          uint256 amount,
          uint256 time
     ); 
     
     event NFTAwarded (
          address indexed Contributor,
          uint256 time
     );

     // Constructor    
     constructor (uint256 _targetAmount, uint256 _withdrawalDate, address _manager, address _nftAddress, address _erc20TokenAddress) {
          require (_withdrawalDate > block.timestamp, 'Withdrawal must be in future');

          targetAmount = _targetAmount;
          withdrawalDate = _withdrawalDate;
          manager = _manager;
          saveNFT = contriNFT(_nftAddress);
          SaveToken = IERC20(_erc20TokenAddress);
     }

     // Modifier
     modifier onlyManager () {
          require(msg.sender == manager, "you are not authorized");
          _;
     }

     // Save function
     function save (uint256 _amount) external {
          require(msg.sender != address(0), "UNAUTHORIZED");
          require(block.timestamp <= withdrawalDate, 'you can no longer save');
          require(_amount > 0, "you are broke");
          
          bool txn = SaveToken.transferFrom(msg.sender, address(this), _amount);
          require(txn, "Transaction Failed");
          
          // Check if the caller is a first-time contributor
          if (contributions[msg.sender] == 0) {
                contributorsCount += 1;
          }
          
          contributions[msg.sender] += _amount;
          
          // Award NFT if the user reaches the savings threshold
          if (contributions[msg.sender] >= nftThreshold && !hasReceivedNFT[msg.sender]) {
                saveNFT.contributorNft(msg.sender);
                hasReceivedNFT[msg.sender] = true;
                emit NFTAwarded(msg.sender, block.timestamp);
          }
          
          emit Contributed(msg.sender, _amount, block.timestamp);
     }

     // Withdrawal function
     function withdrawal () external onlyManager {
          require(block.timestamp >= withdrawalDate, 'not yet time');
          require (SaveToken.balanceOf(address(this)) >= targetAmount, 'amount not reached');

          uint256 _contractBal = SaveToken.balanceOf(address(this));
          bool txn = SaveToken.transfer(manager, _contractBal);
          require(txn, "Transaction Failed");

          emit Withdrawn(_contractBal, block.timestamp);
     }

     function getBalance() public view returns(uint256) {
         return SaveToken.balanceOf(address(this));
     }

     function getNFTBalance(address _address) public view returns (uint256) {
         return saveNFT.balanceOf(_address);
     }
}
