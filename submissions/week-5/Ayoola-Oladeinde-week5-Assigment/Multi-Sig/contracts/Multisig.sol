// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract MultiSigBoard {
    error NotBoardMember();
    error AlreadySigned();
    error NotEnoughSignatures();
    error TransferFailed();
    error InvalidRecipient();
    error InvalidAmount();
    error MemberAlreadyExists();
    error MemberNotFound();
    error MaxBoardMembersReached();

    uint256 public constant MAX_BOARD_MEMBERS = 20;
    address[] public boardMembers;
    mapping(address => bool) public isBoardMember;
    mapping(bytes32 => mapping(address => bool)) public signed;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event Signed(address indexed signer, bytes32 txHash);
    event BoardMemberAdded(address indexed member);
    event BoardMemberRemoved(address indexed member);

    modifier onlyBoardMember() {
        if (!isBoardMember[msg.sender]) revert NotBoardMember();
        _;
    }

    function addBoardMember(address member) external {
        if (isBoardMember[member]) revert MemberAlreadyExists();
        if (boardMembers.length >= MAX_BOARD_MEMBERS)
            revert MaxBoardMembersReached();

        isBoardMember[member] = true;
        boardMembers.push(member);
        emit BoardMemberAdded(member);
    }

    function removeBoardMember(address member) external {
        if (!isBoardMember[member]) revert MemberNotFound();

        isBoardMember[member] = false;
        for (uint256 i = 0; i < boardMembers.length; i++) {
            if (boardMembers[i] == member) {
                boardMembers[i] = boardMembers[boardMembers.length - 1];
                boardMembers.pop();
                break;
            }
        }
        emit BoardMemberRemoved(member);
    }

    function deposit() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function signTransaction(bytes32 txHash) external onlyBoardMember {
        if (signed[txHash][msg.sender]) revert AlreadySigned();
        signed[txHash][msg.sender] = true;
        emit Signed(msg.sender, txHash);
    }

    function executeWithdrawal(
        address payable recipient,
        uint256 amount,
        bytes32 txHash
    ) external onlyBoardMember {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();

        uint256 approvals = 0;
        for (uint256 i = 0; i < boardMembers.length; i++) {
            if (signed[txHash][boardMembers[i]]) {
                approvals++;
            }
        }
        if (approvals < boardMembers.length) revert NotEnoughSignatures();

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawal(recipient, amount);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
