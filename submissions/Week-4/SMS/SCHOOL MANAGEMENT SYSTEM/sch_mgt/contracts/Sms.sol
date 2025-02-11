// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Sms {
    address public owner;
    uint256 public studentCount;
    uint256 public staffCount;

    enum Role { None, Student, Staff, Admin }

    struct Student {
        uint256 id;
        string name;
        address wallet;
        bool hasPaidFees;
        uint256 feesPaid;
    }

    struct Staff {
        uint256 id;
        string name;
        address wallet;
    }

    mapping(address => Role) public roles;
    mapping(address => Student) public students;
    mapping(address => Staff) public staff;
    mapping(address => uint256) public balances;

    event StudentRegistered(uint256 id, string name, address wallet);
    event StaffRegistered(uint256 id, string name, address wallet);
    event FeesPaid(address indexed student, uint256 amount);

    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Not an admin");
        _;
    }

    modifier onlyStudent() {
        require(roles[msg.sender] == Role.Student, "Not a student");
        _;
    }

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Admin;
    }

    function registerStudent(address _wallet, string memory _name) external onlyAdmin {
        require(roles[_wallet] == Role.None, "Already registered");
        studentCount++;
        students[_wallet] = Student(studentCount, _name, _wallet, false, 0);
        roles[_wallet] = Role.Student;
        emit StudentRegistered(studentCount, _name, _wallet);
    }

    function registerStaff(address _wallet, string memory _name) external onlyAdmin {
        require(roles[_wallet] == Role.None, "Already registered");
        staffCount++;
        staff[_wallet] = Staff(staffCount, _name, _wallet);
        roles[_wallet] = Role.Staff;
        emit StaffRegistered(staffCount, _name, _wallet);
    }

    function payFees() external payable onlyStudent {
        require(msg.value > 0, "Payment must be greater than 0");
        students[msg.sender].hasPaidFees = true;
        students[msg.sender].feesPaid += msg.value;
        balances[owner] += msg.value;
        emit FeesPaid(msg.sender, msg.value);
    }

    function withdrawFees() external onlyAdmin {
        uint256 amount = balances[owner];
        require(amount > 0, "No fees to withdraw");
        balances[owner] = 0;
        payable(owner).transfer(amount);
    }
}
