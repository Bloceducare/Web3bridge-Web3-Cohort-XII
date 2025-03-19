// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./PiggyBank-ERC721.sol";
import "./PiggyBank-ERC20.sol";


interface IOurERC721 is IERC721 {
    function mint(address _to) external;    
}


contract PiggyBank {
    // State variables
    MayToken public token;
    PiggyBankNFT public nft;
    uint256 public targetAmount;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;

    // Mappings
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasReceivedNFT;

    // Events
    event Contributed(address indexed contributor, uint256 amount, uint256 time);
    event Withdrawn(uint256 amount, uint256 time);
    event NFTMinted(address indexed recipient, uint256 tokenId);
    

    // Constructor
    constructor(address _token, address _nft, uint256 _targetAmount, uint256 _withdrawalDate, address _manager) {
        require(_withdrawalDate > block.timestamp, "WITHDRAWAL MUST BE IN FUTURE");
        require(_token != address(0), "INVALID TOKEN ADDRESS");
        require(_nft != address(0), "INVALID NFT CONTRACT ADDRESS");
        
        token = MayToken(_token);
        nft = PiggyBankNFT(_nft);
        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "YOU WAN THIEF ABI ?");
        _;
    }

    // Save (Deposit tokens)
    function save(uint256 amount) external {
        require(msg.sender != address(0), "UNAUTHORIZED ADDRESS");
        require(block.timestamp <= withdrawalDate, "YOU CAN NO LONGER SAVE");
        require(amount > 0, "YOU ARE BROKE");

        // Check token balance and allowance
        require(token.balanceOf(msg.sender) >= amount, "INSUFFICIENT BALANCE");
        require(token.allowance(msg.sender, address(this)) >= amount, "INSUFFICIENT ALLOWANCE");


        // Transfer tokens from sender to contract
        require(token.transferFrom(msg.sender, address(this), amount), "TRANSFER FAILED");

        // Check if the caller is a first-time contributor
        if (contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }

        contributions[msg.sender] += amount;

        //Mint NFT if this is second contribution
        if (contributions[msg.sender] > amount && !hasReceivedNFT[msg.sender]) {
            
            uint256 tokenId = nft.mintNFT(msg.sender);
            hasReceivedNFT[msg.sender] = true;
            emit NFTMinted(msg.sender, tokenId);
        }

        emit Contributed(msg.sender, amount, block.timestamp);
    }

    // Withdrawal
    function withdraw() external onlyManager {
        require(block.timestamp >= withdrawalDate, "NOT YET TIME");
        require(token.balanceOf(address(this)) >= targetAmount, "TARGET AMOUNT NOT REACHED");

        uint256 contractBalance = token.balanceOf(address(this));
        require(token.transfer(manager, contractBalance), "TRANSFER FAILED");

        emit Withdrawn(contractBalance, block.timestamp);
    }

    
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}