// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

// import ERC20 et ERC721
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// custom ERC721 interface
interface ICustomERC721 is IERC721 {
    function mint(address to) external;
}

contract PiggyBank {
   
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    ICustomERC721 public PiggyNFT;
    mapping(address => uint256) public nbContribution;
    mapping(address => uint256) public nftId;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;
    IERC20 public PiggyToken;

    // events
    event Contributed(
        address indexed contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn(uint256 amount, uint256 time);

  
    constructor(
        uint256 _targetAmount,
        uint256 _withdrawalDate,
        address _manager,
        address _piggyToken,
        address _piggyNFT
    ) {
        require(_withdrawalDate > block.timestamp, "WITHDRAWAL MUST BE IN FUTURE");

        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        PiggyToken = IERC20(_piggyToken);
        PiggyNFT = ICustomERC721(_piggyNFT);
    }

    modifier onlyManager() {
        require(msg.sender == manager, "YOU WAN THIEF ABI ?");
        _;
    }

 
    function save(uint256 amount) external {
        uint256 ContributorBalance = PiggyToken.balanceOf(msg.sender);
        require(msg.sender != address(0), "UNAUTHORIZED ADDRESS");
        require(block.timestamp <= withdrawalDate, "YOU CAN NO LONGER SAVE");
        require(amount > 0   , "YOU ARE BROKE");

        // PiggyToken.approve(address(this), amount);
        require(PiggyToken.allowance(msg.sender, address(this)) >= amount, "INSUFFICIENT ALLOWANCE");

        bool txn = PiggyToken.transferFrom(msg.sender, address(this), amount);
        require(txn, "TRANSACTION FAILED");


        if (contributions[msg.sender] == 0) {
            contributorsCount += 1;
        } else if (nbContribution[msg.sender] >= 2) {

            require(address(PiggyNFT) != address(0), "NFT CONTRACT NOT SET");
            PiggyNFT.mint(msg.sender);
            nftId[msg.sender] += 1;

        }

        contributions[msg.sender] += amount;
        nbContribution[msg.sender] += 1;

        emit Contributed(msg.sender, amount, block.timestamp);
    }

    function withdrawal() external onlyManager {
        require(block.timestamp >= withdrawalDate, "NOT YET TIME");

        uint256 contractBalance = PiggyToken.balanceOf(address(this));
        require(contractBalance >= targetAmount, "TARGET AMOUNT NOT REACHED");

        bool txn = PiggyToken.transfer(manager, contractBalance);
        require(txn, "WITHDRAWAL FAILED");

        emit Withdrawn(contractBalance, block.timestamp);
    }
}
