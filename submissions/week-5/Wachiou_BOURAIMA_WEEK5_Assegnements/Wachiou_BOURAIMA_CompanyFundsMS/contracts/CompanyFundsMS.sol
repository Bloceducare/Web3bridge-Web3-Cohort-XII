// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./ERC20Token.sol";
error alreadySigned();
error MissingSignature(uint8 expexted, uint256 actual);
error InvalidProof();
error InvalidSignature();
error InvalidClaim();
error evalidamount();
error unauthorized();
error InvalidDate();
error NotFound();

contract CompanyFundsMS {
    address public owner;
    ERC20Token public token;
    bytes32 public _merkleRoot;
    uint256 public totalExpenses;
    uint256 public CountExpenses;
    uint256 public totalClaimed;
    uint256 public monthlyBudget;
    uint256 public funds;

    mapping(uint256 => mapping(address => bool)) signatures;
    mapping(uint256 => Expenses) public expenses;
    address[] public boardMembers;

    event ExpenseCreated(
        uint256 expenseId,
        uint256 amount,
        uint256 date,
        string description
        
    );
    event Signed(address signer, uint256 expenseId);
    event Released(uint256 expenseId, uint256 amount);

    struct Expenses {
        uint256 expenseId;
        uint256 amount;
        uint256 date;
        string description;
        address creator;
    }

    constructor(address tokenAddr, bytes32 merkleRoot) {
        owner = msg.sender;
        _merkleRoot = merkleRoot;
        token = ERC20Token(tokenAddr);
    }

    function setMonthlyBudget(uint256 amount) public {
        if (msg.sender != owner) {
            revert unauthorized();
        }
        monthlyBudget = amount;
    }

    function createExpenses(
        bytes32[] calldata merkleProof,
        uint256 amount,
        uint256 date,
        string memory description
    ) public {
        if (amount > monthlyBudget) {
            revert evalidamount();
        }
        if (date < block.timestamp) {
            revert InvalidDate();
        }

        uint256 expense_Id = CountExpenses + 1;
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, _merkleRoot, leaf)) {
            revert InvalidProof();
        }
        if (monthlyBudget < totalClaimed + amount) {
            revert evalidamount();
        } else {
            expenses[expense_Id] = Expenses({
                expenseId: expense_Id,
                amount: amount,
                date: date,
                description: description,
                creator: msg.sender
            });
            CountExpenses += 1;
            totalExpenses += amount;
            emit ExpenseCreated(expense_Id, amount, date, description);
        }
    }

    function signExpenses(bytes32[] memory proof, uint256 expense_Id) public {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (expenses[expense_Id].amount == 0) {
            revert NotFound();
        }
        if (!MerkleProof.verify(proof, _merkleRoot, leaf)) {
            revert InvalidProof();
        } else {
        if (signatures[expense_Id][msg.sender] == false) {
            signatures[expense_Id][msg.sender] = true;
            boardMembers.push(msg.sender);
            emit Signed(msg.sender, expense_Id);
                
            }else {
                revert alreadySigned();
            }

            
        }
    }

    function claimExpenses(uint256 expense_Id) public {
        if (msg.sender != expenses[expense_Id].creator) {
            revert InvalidClaim();
        } else {
            verifySignature(expense_Id);
            uint256 amount = expenses[expense_Id].amount;

            token.transfer(msg.sender, amount);
            emit Released(expense_Id, amount);
        }
    }

    function verifySignature(uint256 expense_id) internal view {
        uint8 NumberOfnoSigned = 0;
        for (uint256 i = 0; i < boardMembers.length; i++) {
            
            if (!signatures[expense_id][boardMembers[i]]) {
                NumberOfnoSigned = NumberOfnoSigned + 1;
            }
        }
          if (NumberOfnoSigned  > 0) {
                revert MissingSignature(NumberOfnoSigned, boardMembers.length);
            }
    }

    function fundCompany(uint256 amount) public {
        token.transfer(address(this), amount);
    }
}
