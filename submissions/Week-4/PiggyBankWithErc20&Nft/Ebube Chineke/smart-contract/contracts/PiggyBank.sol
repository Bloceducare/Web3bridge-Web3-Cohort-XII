// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./IEbubeToken.sol";
import "./IERC721.sol";

contract PiggyBank {
    // address constant ADDRESS_ZERO  = 0x0000000000000000000000000000000000000000;
    address public ebubeTokenAddress; // Address of the ERC20 token
    IEbubeToken public ebubeToken;
    address public ebubeNFTAddress; // Address of the ERC721 NFT
    IERC721 public ebubeNFT;

    // state variables
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;

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
    constructor (address _tokenAddress, address _NFTAddress, uint256 _targetAmount, uint256 _withdrawalDate, address _manager) {
        require(_withdrawalDate > block.timestamp, 'WITHDRAWAL MUST BE IN FUTURE');
        require(_tokenAddress != address(0), 'PLEASE PROVIDE A TOKEN ADDRESS');
        require(_NFTAddress != address(0), 'PLEASE PROVIDE A NFT ADDRESS');
        
        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;

        ebubeTokenAddress = _tokenAddress;
        ebubeToken = IEbubeToken(_tokenAddress);
        ebubeNFTAddress = _NFTAddress;
        ebubeNFT = IERC721(_NFTAddress);


    }

    modifier onlyManager () {
        require(msg.sender == manager, 'YOU WAN THIEF ABI ?');
        _;
    }


    // save
    function save (uint256 _amount) external {
        
        require(msg.sender != address(0), 'UNAUTHORIZED ADDRESS');

        require(block.timestamp <= withdrawalDate, 'YOU CAN NO LONGER SAVE');

        require(ebubeTokenAddress != address(0));

        uint256 allowance = ebubeToken.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Insufficient allowance");

        require(ebubeToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // check if the caller is a first time contributor
        if(contributions[msg.sender] == 0) {
            contributorsCount += 1;
        } else {
            //mint ERC71 token for the sender
            ebubeNFT.mint(msg.sender, 1);
        }

        targetAmount = targetAmount + _amount;

        emit Contributed(msg.sender, _amount, block.timestamp);
        
    }

    // withdrawal
    function withdrawal () external onlyManager {
        // require that its withdrawal time or greater
        require(block.timestamp >= withdrawalDate, 'NOT YET TIME');

        // require contract bal is > or = targetAmount
        uint256 _contractBal = ebubeToken.balanceOf(address(this));
        require(_contractBal >= targetAmount, 'TARGET AMOUNT NOT REACHED');
        require(ebubeToken.approve(msg.sender, _contractBal), 'APPROVAL FAILED');

        // transfer to manager
        require(ebubeToken.transfer(msg.sender, _contractBal), "Transfer failed");

        emit Withdrawn(_contractBal, block.timestamp);
    }

}