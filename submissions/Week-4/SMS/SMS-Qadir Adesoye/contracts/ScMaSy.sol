// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ScMaSy {
    // State Variables
    address public schoolAddress;
    uint256 private contractBalance;
    
    // Role Definition
    enum Role { None, Staff, Student }
    
    // Structs
    struct User {
        string name;
        Role role;
        bool exists;
    }
    
    struct StudentInfo {
        uint256 feesPaid;
        uint256 totalFees;
        bool isRegistered;
    }
    
    struct StaffInfo {
        string position;
        bool isAuthorized;
    }
    
    // Mappings
    mapping(address => User) public users;
    mapping(address => StudentInfo) public students;
    mapping(address => StaffInfo) public staff;
    
    // Events
    event UserRegistered(address indexed user, string name, Role role);
    event FeesPaid(address indexed student, uint256 amount);
    event FundsWithdrawn(uint256 amount);
    event Announcement(string message);
    
    // Modifiers
    modifier onlySchool() {
        require(msg.sender == schoolAddress, "Only school can perform this action");
        _;
    }
    
    modifier onlyStaff() {
        require(staff[msg.sender].isAuthorized, "Only staff can perform this action");
        _;
    }
    
    modifier onlyStudent() {
        require(users[msg.sender].role == Role.Student, "Only students can perform this action");
        _;
    }
    
    // Constructor
    constructor(address _schoolAddress) {
        require(_schoolAddress != address(0), "Invalid school address");
        schoolAddress = _schoolAddress;
    }
    
    // Staff Management Functions
    function registerStaff(address _staff, string memory _name, string memory _position) external onlySchool {
        require(_staff != address(0), "Invalid staff address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_position).length > 0, "Position cannot be empty");
        require(!users[_staff].exists, "User already registered");
        
        users[_staff] = User(_name, Role.Staff, true);
        staff[_staff] = StaffInfo(_position, true);
        emit UserRegistered(_staff, _name, Role.Staff);
    }
    
    // Student Management Functions
    function registerStudent(address _student, string memory _name, uint256 _totalFees) external onlyStaff {
        require(_student != address(0), "Invalid student address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_totalFees > 0, "Fees must be greater than 0");
        require(!users[_student].exists, "User already registered");
        
        users[_student] = User(_name, Role.Student, true);
        students[_student] = StudentInfo(0, _totalFees, true);
        emit UserRegistered(_student, _name, Role.Student);
    }
    
    // Fee Management Functions
    function payFees() external payable onlyStudent {
        require(students[msg.sender].isRegistered, "Student not registered");
        require(msg.value > 0, "Invalid amount of ETH");
        
        students[msg.sender].feesPaid += msg.value;
        contractBalance += msg.value;
        emit FeesPaid(msg.sender, msg.value);
    }
    
    function withdrawFunds() external onlySchool {
        require(contractBalance > 0, "No funds to withdraw");
        uint256 amount = contractBalance;
        contractBalance = 0;
        
        (bool success, ) = schoolAddress.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(amount);
    }
    
    // Information Functions
    function getStudentInfo(address _student) external view returns (
        uint256 getFeesPaid,
        uint256 getTotalFees,
        bool getIsRegistered
    ) {
        require(users[_student].role == Role.Student, "Not a student");
        StudentInfo storage s = students[_student];
        return (s.feesPaid, s.totalFees, s.isRegistered);
    }
    
    function getUserInfo(address _user) external view returns (
        string memory getName,
        Role getRole,
        bool getExists
    ) {
        User storage u = users[_user];
        return (u.name, u.role, u.exists);
    }
    
    function getContractBalance() external view returns (uint256) {
        return contractBalance;
    }
    
    // Communication Functions
    function makeAnnouncement(string memory message) external onlySchool {
        require(bytes(message).length > 0, "Message cannot be empty");
        emit Announcement(message);
    }
}