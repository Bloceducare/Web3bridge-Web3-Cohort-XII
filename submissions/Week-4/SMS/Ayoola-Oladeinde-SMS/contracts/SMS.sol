// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SchoolSystem {
    address public principal;

    struct Student {
        string name;
        uint256 classLevel;
        uint256 feesPaid;
        bool exists;
    }

    struct Teacher {
        string name;
        string subject;
        uint256 salary;
        bool exists;
    }

    mapping(address => Student) public students;
    mapping(address => Teacher) public teachers;
    address[] public studentList;
    address[] public teacherList;

    event StudentAdded(address indexed student, string name, uint256 classLevel);
    event TeacherAdded(address indexed teacher, string name, string subject);
    event FeePaid(address indexed student, uint256 amount);
    event FundsWithdrawn(address indexed principal, uint256 amount);
    event SalaryPaid(address indexed teacher, uint256 amount);

    modifier onlyPrincipal() {
        require(msg.sender == principal, "Only principal can perform this action");
        _;
    }

    constructor() {
        principal = msg.sender;
    }

    function addStudent(address _student, string memory _name, uint256 _classLevel) public onlyPrincipal {
        require(!students[_student].exists, "Student already exists");
        students[_student] = Student(_name, _classLevel, 0, true);
        studentList.push(_student);
        emit StudentAdded(_student, _name, _classLevel);
    }

    function addTeacher(address _teacher, string memory _name, string memory _subject, uint256 _salary) public onlyPrincipal {
        require(!teachers[_teacher].exists, "Teacher already exists");
        teachers[_teacher] = Teacher(_name, _subject, _salary, true);
        teacherList.push(_teacher);
        emit TeacherAdded(_teacher, _name, _subject);
    }

    function payFees() public payable {
        require(students[msg.sender].exists, "You are not registered as a student");
        require(msg.value > 0, "Fee amount should be greater than zero");
        students[msg.sender].feesPaid += msg.value;
        emit FeePaid(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _amount) public onlyPrincipal {
        require(address(this).balance >= _amount, "Insufficient funds");
        payable(principal).transfer(_amount);
        emit FundsWithdrawn(principal, _amount);
    }

    function payTeacherSalary(address _teacher) public onlyPrincipal {
        require(teachers[_teacher].exists, "Teacher not found");
        require(address(this).balance >= teachers[_teacher].salary, "Insufficient funds");
        payable(_teacher).transfer(teachers[_teacher].salary);
        emit SalaryPaid(_teacher, teachers[_teacher].salary);
    }

    function getStudentDetails(address _student) public view returns (string memory, uint256, uint256) {
        require(students[_student].exists, "Student not found");
        Student memory student = students[_student];
        return (student.name, student.classLevel, student.feesPaid);
    }

    function getTeacherDetails(address _teacher) public view returns (string memory, string memory, uint256) {
        require(teachers[_teacher].exists, "Teacher not found");
        Teacher memory teacher = teachers[_teacher];
        return (teacher.name, teacher.subject, teacher.salary);
    }
}
