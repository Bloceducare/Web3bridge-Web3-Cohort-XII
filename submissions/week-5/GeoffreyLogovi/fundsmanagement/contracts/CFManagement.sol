// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ERC20.sol";

contract CFManagement {
    address public manager;
    IntERC20 public token;

    struct Month {
        uint256 duration;
        uint256 amount;
    }

    mapping(address => bool) public board;
    address[] public boardList;

    uint256 public monthsCount;
    uint256 public boardCount;
    uint256 public budget;

    // Handle errors
    error InsuficientAmount();
    error InvalidAmount();
    error OnlyManager();
    error InvalidDuration();
    error InsuficientBalance();
    error InvalidAddress();
    error MaximumboardReached();
    error OnlyBoardMember();
    error HaveAlreadySigned();
    error InsuficientSigners();

    modifier onlyManager() {
        if(msg.sender != manager) revert OnlyManager();
        _;
    }

    modifier onlyBoardMember() {
        if(!board[msg.sender]) revert OnlyBoardMember();
        _;
    }

    constructor(address _token) {
        manager = msg.sender;
        token = IntERC20(_token);
    }

    // Get funded
    function moov(address _investor, uint256 _amount) external {
        if(_amount <= 0) revert InvalidAmount();
        if(token.balanceOf(_investor) < _amount) revert InsuficientAmount();
        token.transferFrom(_investor, address(this), _amount);
    }

    // Budgetisation
    function budgeting(uint256 _duration, uint256 _amount) external onlyManager() {
        if(_duration <= block.timestamp) revert InvalidDuration();

        if(_amount <= 0) revert InvalidAmount();
        Month(_duration, _amount);

        budget = _amount;
        monthsCount++;
    }


    // Push Board
    function pushBoard(address _member) external onlyManager() {
        if(_member == address(0)) revert InvalidAddress();
        if(boardCount >= 20) revert MaximumboardReached();

        board[_member] = false;
        boardList.push(_member);
        boardCount++;
    }

    // Signe agreement on budget
    function signeAgreement() external onlyBoardMember() {
        if(board[msg.sender] == true) revert HaveAlreadySigned();
        board[msg.sender] = true;
    }

    // Release funds
    function releaseFunds() public onlyManager() {
        uint256 totalSignes;

        for(uint256 i = 0; i < boardList.length; i++) {
            if(board[boardList[i]] == true) {
                totalSignes++;
            }
        }
        if(totalSignes < boardCount) revert InsuficientSigners();
        token.transfer(msg.sender, budget);
    }

}
