// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScholarshipFund is ReentrancyGuard {
    // State Variables
    address public owner;
    uint public totalReservedFunds;
    uint public constant SCHOLARSHIP_AMOUNT = 0.005 ether; // Fixed amount

    // Struct to store student applications
    struct Application {
        address student;      // Explicit student address
        string name;         // Student name
        string course;       // Course name
        uint16 age;          // Student age
        bool approved;       // Approval status
        bool hasWithdrawn;   // Withdrawal status
    }

    // Mapping to store student applications
    mapping(address => Application) public applications;
    
    // Mapping to track donors and their contributions
    mapping(address => uint) public donations;
    
    // Event declarations
    event Donated(address indexed donor, uint amount);
    event Applied(address indexed student, string name);
    event Approved(address indexed student);
    event Withdrawn(address indexed student);
    event Rejected(address indexed student);
    
    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    // Constructor to set the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }
	

    // Function to donate to the scholarship fund
    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0.");
        donations[msg.sender] += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    // Function for students to apply for a scholarship
    // change memory to calldata or implement hashing for name and course
    function applyForScholarship(string memory _name, uint16 _age, string memory _course) external {
	require(msg.sender != owner, "Owner cannot apply");
        require(applications[msg.sender].student == address(0), "You have already applied.");
        
         applications[msg.sender] = Application({
            student: msg.sender,
            name: _name,
            course: _course,
            age: _age,
            approved: false,
            hasWithdrawn: false
        });
        
        emit Applied(msg.sender, _name);
    }

    // Function for the owner to approve a scholarship application
    function approveScholarship(address _student) external onlyOwner {
        Application storage application = applications[_student];
        require(application.student != address(0), "Application does not exist.");
        require(!application.approved, "Application already approved.");
        
	uint availableBalance = address(this).balance - totalReservedFunds;
        require(availableBalance >= SCHOLARSHIP_AMOUNT, "Insufficient funds");

	totalReservedFunds += SCHOLARSHIP_AMOUNT;
        application.approved = true;

        emit Approved(_student);
    }

    // Function for approved students to withdraw funds
    function withdraw() external nonReentrant{
        Application storage application = applications[msg.sender];
        require(application.approved, "Your application has not been approved.");
        require(!application.hasWithdrawn, "Already withdrawn");

        application.hasWithdrawn = true;
        totalReservedFunds -= SCHOLARSHIP_AMOUNT;

        (bool success, ) = payable(msg.sender).call{value: SCHOLARSHIP_AMOUNT}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender);
    }

    	// Function to reject invalid Application
	function rejectApplication(address _student) external onlyOwner {
        require(applications[_student].student != address(0), "Application not found");
        delete applications[_student];
        emit Rejected(_student);
    }

// Function to check contract balance
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

     //block accidental transfers so donations can be tracked
    receive() external payable {
        revert("Use donate() function");
    }

    // Prevent ETH transfers via fallback
    fallback() external payable {
        revert("Direct transfers not allowed");
    }

}
