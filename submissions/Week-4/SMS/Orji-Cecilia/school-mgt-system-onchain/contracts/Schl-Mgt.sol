// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SchlMgt {
    struct Student {
        uint id;
        string name;
        uint age;
        string gender;
        uint grade;
        address studentAddress;
        uint classId;
        bool hasPaidFees;
    }

    struct Teacher {
        uint id;
        string name;
        string subject;
        uint classId;
        address teacherAddress;
    }

    struct Class {
        uint id;
        string name;
        uint teacherId;
        uint[] studentIds;
    }

    struct Principal {
        address principalAddress;
    }

    // STATE VARIABLES
    Student[] public students;
    mapping(address => uint) public studentIndex;
    mapping(address => uint) public studentToClass;
    mapping(address => bool) public hasPaidFees;

    Teacher[] public teachers;
    address[] public teacherAddresses;

    mapping(address => uint) public teacherIndex;
    mapping(address => bool) public isTeacher;

    Class[] public classes;
    mapping(uint => uint) public classIndex;

    Principal public principal;
    uint public nextStudentId = 1;
    uint public nextTeacherId = 1;
    uint public nextClassId = 1;

    //events
    event StudentAdded(uint id, string name, uint age, uint grade, uint classId, address studentAddress);
    event TeacherAdded(uint id, string name, string subject);
    event TeacherRemoved(uint id, address teacherAddress);
    event ClassCreated(uint id, string name, uint teacherId);
    event SchoolFeesPaid(uint id, uint amount);

    constructor(address adminAddress) {
        require(adminAddress != address(0), "Invalid admin address");
        principal.principalAddress = adminAddress;
    }

    modifier onlyPrincipal() {
        require(msg.sender == principal.principalAddress, "Only principal can call this function");
        _;
    }

    modifier onlyTeacherOrPrincipal() {
        require(isTeacher[msg.sender] || msg.sender == principal.principalAddress, "Not authorized");
        _;
    }

    //Principal role
    function assignTeacher(address teacherAddress, string memory name, string memory subject) public onlyPrincipal {
    require(!isTeacher[teacherAddress], "Teacher already exists");

    teachers.push(Teacher(nextTeacherId, name, subject, 0, teacherAddress));
    teacherIndex[teacherAddress] = nextTeacherId;
    isTeacher[teacherAddress] = true;
    teacherAddresses.push(teacherAddress);

    uint assignedTeacherId = nextTeacherId; 
    nextTeacherId++; 

    emit TeacherAdded(assignedTeacherId, name, subject); 
    }

    function removeTeacher(address teacherAddress) public onlyPrincipal {
        require(isTeacher[teacherAddress], "Teacher not found");
        uint index = teacherIndex[teacherAddress] - 1;

        teachers[index] = teachers[teachers.length - 1];
        teacherIndex[teachers[index].teacherAddress] = index + 1;
        teachers.pop();
        delete teacherIndex[teacherAddress];
        delete isTeacher[teacherAddress];

        emit TeacherRemoved(index + 1, teacherAddress);
    }

    function withdraw() public onlyPrincipal {
        payable(principal.principalAddress).transfer(address(this).balance);
    }

    //Teacher or Principal role
    function registerStudent(string memory name, uint age, string memory gender, uint grade, address studentAddress, uint classId) public onlyTeacherOrPrincipal {
        students.push(Student(nextStudentId, name, age, gender, grade, studentAddress, classId, false));
        studentIndex[studentAddress] = nextStudentId;
        studentToClass[studentAddress] = classId;
        emit StudentAdded(nextStudentId, name, age, grade, classId, studentAddress);
        nextStudentId++;
    }

    //Students
    function getStudentGrade() public view returns (uint) {
        require(studentIndex[msg.sender] != 0, "Student not registered");
        return students[studentIndex[msg.sender] - 1].grade;
    }

    function getStudentClass() public view returns (string memory) {
        require(studentIndex[msg.sender] != 0, "Student not registered");
        uint classId = students[studentIndex[msg.sender] - 1].classId;
        return classes[classId - 1].name;
    }

    function paySchoolFees() public payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(studentIndex[msg.sender] != 0, "Student not registered");

        hasPaidFees[msg.sender] = true;
        (bool success, ) = payable(principal.principalAddress).call{value: msg.value}("");
        require(success, "Payment failed");

        emit SchoolFeesPaid(studentIndex[msg.sender], msg.value);
    }
}
