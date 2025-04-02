// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract PiggyBankErc20 is ERC721 {  

  uint256 public targetAmount;
  uint256 public immutable withdrawalDate; // so that we will initialize this when we first deploy
  address public owner;
  uint32 public contributorsCount;
  mapping(address => uint256) public contributions;

  IERC20 public token;

  mapping(address => bool) public hasNFT;

  // events
  event Contributed (address indexed Contributor, uint256 amount, uint time); // indexed to make it assessable
  event WithDrawn (uint256 amount, uint time);

  event NFTMinted (address indexed to, uint256 tokenId);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can call this function");
    _;
  }

  constructor(uint256 _targetAmount, uint256 _withdrawalDate, address _tokenAddress, address _owner) 
    ERC721("PiggyBank", "PB") 
  {
    require(_withdrawalDate > block.timestamp, "Withdrawal date must be in the future");

    targetAmount = _targetAmount;
    withdrawalDate = _withdrawalDate;
    token = IERC20(_tokenAddress); // address of the token
    owner = _owner;
  }

  function deposit(uint256 _amount) external { // payable: for the user to send ether but now i'm sending ERC20 tokens
    require(msg.sender != address(0), "Invalid address");
    require(block.timestamp <= withdrawalDate, "Withdrawal date has passed");
    require(_amount > 0, "You are Broke"); 
    require(token.transferFrom(msg.sender, address(this), 1), "Transfer failed"); // transfer tokens to the contract

    if(contributions[msg.sender] == 0) { // if the user has not contributed before
      contributorsCount += 1;
    }
    
    if(contributions[msg.sender] ==2 && !hasNFT[msg.sender]) { // if the user has contributed more than once and has not minted an NFT
      _safeMint(msg.sender, contributorsCount); // mint an NFT for the user

      hasNFT[msg.sender] = true; 
      emit NFTMinted(msg.sender, contributorsCount);
    }

    contributions[msg.sender] += _amount;

    emit Contributed(msg.sender, _amount, block.timestamp);
  }

  // mint function
  function safeMint(address to, uint256 tokenId) public onlyOwner() {
    _safeMint(to, tokenId); //
  }

  // withdraw function
  function withdrawl() external onlyOwner {
    require(block.timestamp >= withdrawalDate, "Withdrawal date has not passed");
    require(address(this).balance >= targetAmount, "Target amount not met"); // check if the target amount is met, this means that the owner can only withdraw if the target amount is met
    require(token.transfer(owner, 1), "Withdrawal failed"); // transfer tokens to the owner

    uint256 _contractBal = address(this).balance; // get the contract balance
    token.balanceOf(address(this)); // get the balance of the contract

    emit WithDrawn(_contractBal, block.timestamp); 

    payable(msg.sender).transfer(address(this).balance); // transfer the balance to the owner    
  }



}