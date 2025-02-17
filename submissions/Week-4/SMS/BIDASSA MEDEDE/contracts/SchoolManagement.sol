// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract SchoolManagementSystem {
    address public owner;

    constructor () {
        owner = msg.sender;
    }

    struct Student {
        uint256 id;
        string name;
        address wallet;
        uint256 age;
        string course;
        uint256 feesPaid;
        bool feesCleared;
        uint256 attendanceCount;
    }

    uint public studentCount;

    mapping(address => Student) public students;

    mapping(address => mapping(uint256 => bool)) attendance;

    enum Role {
        Teacher,
        Admin
    }

    struct Staff {
        uint256 id;
        string name;
        address wallet;
        Role role;
        string department;
        bool isActive;
    }

    mapping(address => Staff) public staff;

    modifier onlyPrincipal() {
        require(msg.sender == owner, "NON AUTHORIZED !");

        _;
    }

    modifier onlyStaff() {
        require(staff[msg.sender].isActive, "NON AUTHORIZED !");

        _;
    }

    modifier onlyStudent() {
        require(students[msg.sender].wallet != address(0), "NON AUTHORIZED !");

        _;
    }

    function addStudent(
        uint256 _id,
        string memory _name,
        address _wallet,
        uint256 _age,
        string memory _course
    ) public onlyPrincipal {
        require(_wallet != address(0), "Invalid wallet address !");
        
        students[_wallet] = Student(
            _id,
            _name,
            _wallet,
            _age,
            _course,
            0,
            false,
            0
        );

        studentCount++;
    }

    function removeStudent(address _wallet) public onlyPrincipal {
        delete students[_wallet];
        studentCount--;
    }

    function addStaff(
        uint256 _id,
        string memory _name,
        address _wallet,
        Role _role,
        string memory _department
    ) public onlyPrincipal {
        require(_wallet != address(0), "WRONG ADDRESS");
        staff[_wallet] = Staff(
            _id,
            _name,
            _wallet,
            _role,
            _department,
            true
        );
    }

    function removeStaff(address _wallet) public onlyPrincipal {
        delete staff[_wallet];
    }

    function signeAttendance(address _student, uint256 _date) public onlyStaff {
        require(students[_student].wallet != address(0), "STUDENT NOT FOUND");
        require(!attendance[_student][_date], "ALREADY MARKED !");

        attendance[_student][_date] = true;
        students[_student].attendanceCount++;
    }

    function getFeeStatus() public view onlyStudent returns (uint256, bool) {
        Student memory currentStudent = students[msg.sender];
        return (currentStudent.feesPaid, currentStudent.feesCleared);
    }

    function payFees() public payable onlyStudent {
        require(msg.value > 0, "INVALID AMOUNT !");

        students[msg.sender].feesPaid += msg.value;

        if (students[msg.sender].feesPaid >= 1 ether) {
            students[msg.sender].feesCleared = true;
        }
    }
}