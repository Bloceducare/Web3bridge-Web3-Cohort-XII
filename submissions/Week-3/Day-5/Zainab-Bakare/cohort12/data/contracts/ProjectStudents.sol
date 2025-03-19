// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectStudents {
    address public professor;

    struct Student {
        uint256 id;
        string name;
        uint8 grade; // Grade (0 - 200)
        bool isRegistered;
    }

    mapping(address => Student) public students;

    event StudentAdded(address studentAddress, string name, uint256 id);
    event GradeAssigned(address studentAddress, uint8 grade);

    modifier onlyProfessor() {
        require(msg.sender == professor, "Only the professor can perform this action");
        _;
    }

    modifier studentExists(address studentAddress) {
        require(students[studentAddress].isRegistered, "Student not registered");
        _;
    }

    constructor() {
        professor = msg.sender;
    }

    function addStudent(address studentAddress, uint256 id, string memory name) public onlyProfessor {
        require(!students[studentAddress].isRegistered, "Student already registered");
        
        students[studentAddress] = Student(id, name, 0, true);
        emit StudentAdded(studentAddress, name, id);
    }

    function assignGrade(address studentAddress, uint8 grade) public onlyProfessor studentExists(studentAddress) {
        require(grade <= 200, "Grade must be between 0 and 200");

        students[studentAddress].grade = grade;
        emit GradeAssigned(studentAddress, grade);
    }

    function getStudentGrade() public view studentExists(msg.sender) returns (uint8) {
        return students[msg.sender].grade;
    }
}
