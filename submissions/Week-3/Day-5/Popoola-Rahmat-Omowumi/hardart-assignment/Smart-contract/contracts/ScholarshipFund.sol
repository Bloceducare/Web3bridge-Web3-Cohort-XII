// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScholarshipFund {
    address public owner;
    uint256 public totalFunds;

    struct Scholarship {
        string name;
        uint256 amount;
        bool awarded;
    }

    struct Student {
        string name;
        uint256 age;
        bool hasApplied;
    }

    mapping(address => Student) public students;
    mapping(address => Scholarship) public scholarships;

    event ScholarshipAwarded(address indexed student, uint256 amount);
    event FundsDeposited(address indexed donor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyNewApplicants() {
        require(!students[msg.sender].hasApplied, "Already applied");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function applyForScholarship(string memory _name, uint256 _age) external onlyNewApplicants {
        require(_age >= 18, "Must be at least 18 years old");
        students[msg.sender] = Student(_name, _age, true);
    }

    function awardScholarship(address studentAddr, string memory _name, uint256 _amount) external onlyOwner {
        require(students[studentAddr].hasApplied, "Student has not applied");
        require(_amount <= totalFunds, "Insufficient funds");
        require(!scholarships[studentAddr].awarded, "Scholarship already awarded");
        
        scholarships[studentAddr] = Scholarship(_name, _amount, true);
        totalFunds -= _amount;
        payable(studentAddr).transfer(_amount);
        emit ScholarshipAwarded(studentAddr, _amount);
    }
}
