// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CompanyFunds {
    address[] public boardMembers;
    mapping(address => bool) public isBoardMember; // Mapping to check if an address is a board member
    mapping(address => bool) public signatures;
    uint256 public requiredSignatures;
    uint256 public totalSignatures;
    IERC20 public token;

    constructor(address[] memory _boardMembers, address _tokenAddress) {
        boardMembers = _boardMembers;
        requiredSignatures = _boardMembers.length;
        token = IERC20(_tokenAddress);

        // Initialize the isBoardMember mapping
        for (uint i = 0; i < _boardMembers.length; i++) {
            isBoardMember[_boardMembers[i]] = true;
        }
    }

    modifier onlyBoardMember() {
        require(isBoardMember[msg.sender], "Only board members can call this function");
        _;
    }

    function signBudget() public onlyBoardMember {
        require(!signatures[msg.sender], "Already signed");
        signatures[msg.sender] = true;
        totalSignatures++;
    }

    function releaseFunds(address _recipient, uint256 _amount) public onlyBoardMember {
        require(totalSignatures == requiredSignatures, "All signatures not present");
        require(token.transfer(_recipient, _amount), "Transfer failed");

        // Reset signatures after successful transfer
        for (uint i = 0; i < boardMembers.length; i++) {
            signatures[boardMembers[i]] = false;
        }
        totalSignatures = 0;
    }

    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
