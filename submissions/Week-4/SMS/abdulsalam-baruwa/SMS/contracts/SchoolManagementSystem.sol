// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

// 1 - All neccesary functions for Staff and students are implemented.
// 2 - Aside the regular SMS functionalities, students should be able to pay school fees from the platform using Ether

// Contract Task: Simple Class Registration System
// Objective: Develop a simple smart contract for a class registration system that allows an admin to manage student enrollments.
// Requirements:
// Admin Role: The contract should have a single admin who can perform administrative actions.
// Student Registration: The admin can register students for a class with a unique student ID and name.
// Student Query: Any user should be able to retrieve a list of registered students.
// Functions:
// register staff
// registerStudent()
// removeStudent()
// getStudent by Id
// pay fees to the contract address

contract SchoolManagementSystem {
    address internal immutable principal;
    uint256 public pupilCount;
    uint256 private teacherCount;

    enum FeesStatus {
        paid,
        notPaid
    }

    enum Grade {
        one,
        two,
        three,
        four,
        five,
        six
    }
    enum Gender {
        male,
        female
    }

    struct Pupil {
        string name;
        uint8 age;
        address addr;
        Grade grade;
        uint dateJoined;
        Gender gender;
        FeesStatus feesStatus;
    }

    struct Teacher {
        string name;
        address addr;
        Grade grade;
        Gender gender;
    }

    mapping(Grade => uint256) private fees;
    mapping(address => Teacher) private teachers;
    mapping(address => bool) private isTeacher;
    mapping(address => Pupil) public pupils;
    mapping(address => bool) public isPupil;

    event PupilRegistered(uint256 id, string name);
    event PupilRemoved(uint256 id, string name);
    event TeacherAdded(string name, address addr);
    event TeacherRemoved(string name, address addr);
    event FeesPaid(uint256 amount, uint256 id, string name);

    constructor() {
        principal = msg.sender;
    }

    modifier onlyPrincipal() {
        require(
            msg.sender == principal,
            "Only the Principal can perform this action"
        );
        _;
    }

    modifier onlyPrincipalOrTeacher() {
        require(
            msg.sender == principal || isTeacher[msg.sender],
            "Only the Principal or Teacher can perform this action"
        );
        _;
    }

    function registerTeacher(
        string memory _name,
        address _addr,
        Grade _grade,
        Gender _gender
    ) external onlyPrincipal {
        teacherCount++;
        require(_addr != address(0), "Invalid teacher address");
        require(!isTeacher[_addr], "Teacher already exists");
        teachers[_addr] = Teacher(_name, _addr, _grade, _gender);
        isTeacher[_addr] = true;
        emit TeacherAdded(_name, _addr);
    }

    function removeTeacher(address _addr) public onlyPrincipal {
        require(_addr != address(0), "Invalid teacher address");
        require(isTeacher[_addr], "Teacher does not exist");
        string memory name = teachers[_addr].name;
        delete teachers[_addr];
        isTeacher[_addr] = false;
        teacherCount--;
        emit TeacherRemoved(name, _addr);
    }

    function getTeacher(
        address _addr
    ) public view onlyPrincipal returns (string memory, Grade) {
        require(_addr != address(0), "Invalid teacher address");
        require(isTeacher[_addr], "Teacher does not exist");

        return (teachers[_addr].name, teachers[_addr].grade);
    }

    function registerStudent(
        string memory _name,
        uint8 _age,
        address _addr,
        Grade _grade,
        // uint _dateJoined,
        Gender _gender,
        FeesStatus _feesStatus
    ) public onlyPrincipalOrTeacher {
        pupilCount++;
        require(_addr != address(0), "Invalid student address");
        require(!isPupil[_addr], "Student already exists");
        require(_age > 3, "Invalid student age");
        // require(_dateJoined > block.timestamp, "Invalid date joined");
        pupils[_addr] = Pupil(
            _name,
            _age,
            _addr,
            _grade,
            block.timestamp,
            _gender,
            _feesStatus
        );
        isPupil[_addr] = true;
        emit PupilRegistered(pupilCount, _name);
    }

    function removeStudent(address _addr) public onlyPrincipalOrTeacher {
        require(_addr != address(0), "Invalid student address");
        require(isPupil[_addr], "Student does not exist");
        string memory name = pupils[_addr].name;
        delete pupils[_addr];
        isPupil[_addr] = false;
        pupilCount--;
        emit PupilRemoved(pupilCount, name);
    }

    function getStudent(
        address _addr
    )
        public
        view
        onlyPrincipalOrTeacher
        returns (string memory, uint8, Grade, uint, Gender, FeesStatus)
    {
        require(_addr != address(0), "Invalid student address");
        require(isPupil[_addr], "Student does not exist");

        return (
            pupils[_addr].name,
            pupils[_addr].age,
            pupils[_addr].grade,
            pupils[_addr].dateJoined,
            pupils[_addr].gender,
            pupils[_addr].feesStatus
        );
    }

    function setFees(Grade _grade) external onlyPrincipal {
        // set fees
        if (_grade == Grade.one) fees[_grade] = 1 gwei;
        else if (_grade == Grade.two) fees[_grade] = 2 gwei;
        else if (_grade == Grade.three) fees[_grade] = 3 gwei;
        else if (_grade == Grade.four) fees[_grade] = 4 gwei;
        else if (_grade == Grade.five) fees[_grade] = 5 gwei;
        else if (_grade == Grade.six) fees[_grade] = 1 ether;
        else revert("Invalid grade");
    }

    function payFees(Grade _grade) public payable {
        require(isPupil[msg.sender], "Not a Student");
        require(pupils[msg.sender].grade == _grade, "Invalid grade");
        require(msg.sender.balance >= fees[_grade], "Insufficient balance");
        require(msg.value == fees[_grade], "Invalid amount");
        require(
            pupils[msg.sender].feesStatus == FeesStatus.notPaid,
            "Fees already paid"
        );

        pupils[msg.sender].feesStatus = FeesStatus.paid;
        emit FeesPaid(msg.value, pupilCount, pupils[msg.sender].name);
    }

    // withdraw fees
    function withdrawFees() external onlyPrincipal {
        payable(principal).transfer(address(this).balance);
    }
}
