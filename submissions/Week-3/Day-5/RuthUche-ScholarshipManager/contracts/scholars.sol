// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScholarshipManager {
    address public owner;
    
    struct Student {
        string name;
        address wallet;
        bool isRegistered;
        uint scholarshipAmount;
        bool hasClaimed;
    }
    
    mapping(address => Student) public students;
    
    event StudentRegistered(address indexed student, string name);
    event ScholarshipAllocated(address indexed student, uint amount);
    event ScholarshipClaimed(address indexed student, uint amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can do this");
        _;
    }
    
    modifier onlyRegisteredStudent() {
        require(students[msg.sender].isRegistered, "You are not a registered student");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerStudent(address _student, string memory _name) external onlyOwner {
        require(!students[_student].isRegistered, "Student already registered");
        students[_student] = Student(_name, _student, true, 0, false);
        emit StudentRegistered(_student, _name);
    }

    /// Allocations of Scholarships
    function allocateScholarship(address _student, uint _amount) external onlyOwner {
        require(students[_student].isRegistered, "Student not registered");
        require(_amount > 0, "Scholarship amount must be greater than zero");
        students[_student].scholarshipAmount = _amount;
        emit ScholarshipAllocated(_student, _amount);
    }
    
    function claimScholarship() external onlyRegisteredStudent {
        Student storage student = students[msg.sender];
        require(student.scholarshipAmount > 0, "No scholarship allocated");
        require(!student.hasClaimed, "Scholarship already claimed");
        student.hasClaimed = true;
        payable(msg.sender).transfer(student.scholarshipAmount);
        emit ScholarshipClaimed(msg.sender, student.scholarshipAmount);
    }
    
    function fundContract() external payable onlyOwner {}

    function getStudentDetails(address _student) external view returns (string memory, uint, bool) {
        Student storage student = students[_student];
        require(student.isRegistered, "Student not registered");
        return (student.name, student.scholarshipAmount, student.hasClaimed);
    }
}
