// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./IERC20.sol";

contract FundsManagement {
    address public manager;
    IntERC20 public token;

    struct Month {
        uint256 duration;
        uint256 amount;
    }

    mapping(address => bool) public boardMembers;
    address[] public boardMembersList;

    uint256 public monthsCount;
    uint256 public boardMembersCount;
    uint256 public budget;

    // error handling
    error InsuficientAmount();
    error InvalidAmount();
    error OnlyManager();
    error InvalidDuration();
    error InsuficientBalance();
    error InvalidAddress();
    error MaximumBoardMembersReached();
    error OnlyBoardMember();
    error HaveAlreadySigned();
    error InsuficientSigners();

    modifier onlyManager() {
        if(msg.sender != manager) revert OnlyManager();
        _;
    }

    modifier onlyBoardMember() {
        if(!boardMembers[msg.sender]) revert OnlyBoardMember();
        _;
    }

    constructor(address _token) {
        manager = msg.sender;
        token = IntERC20(_token);
    }

    // Company getting money from investors
    function cashingIn(address _investor, uint256 _amount) external {

        if(_amount <= 0) revert InvalidAmount();

        if(token.balanceOf(_investor) < _amount) revert InsuficientAmount();

        token.transferFrom(_investor, address(this), _amount);
    }

    // Set the budget of a month
    function budgeting(uint256 _duration, uint256 _amount) external onlyManager() {

        if(_duration <= block.timestamp) revert InvalidDuration();

        if(_amount <= 0) revert InvalidAmount();

        Month(_duration, _amount);

        budget = _amount;

        monthsCount++;
    }


    // add board members
    function addBoardMember(address _member) external onlyManager() {
        if(_member == address(0)) revert InvalidAddress();

        if(boardMembersCount >= 20) revert MaximumBoardMembersReached();

        boardMembers[_member] = false;
        boardMembersList.push(_member);

        boardMembersCount++;
    }

    // signe the budget
    function signeBudget() external onlyBoardMember() {
        if(boardMembers[msg.sender] == true) revert HaveAlreadySigned();

        boardMembers[msg.sender] = true;
    }

    // Release the money
    function releaseMoney() public onlyManager() {

        uint256 totalSignes;

        for(uint256 i = 0; i < boardMembersList.length; i++) {
            if(boardMembers[boardMembersList[i]] == true) {
                totalSignes++;
            }
        }

        if(totalSignes < boardMembersCount) revert InsuficientSigners();

        token.transfer(msg.sender, budget);
    }

}
