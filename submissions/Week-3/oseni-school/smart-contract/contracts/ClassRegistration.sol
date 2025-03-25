// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClassRegistration {
    address public admin;
    
    struct Student {
        uint id;
        string name;
    }

    mapping(uint => Student) private students;
    uint[] private studentIds;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(uint _id, string memory _name) public onlyAdmin {
        require(students[_id].id == 0, "Student ID already exists");
        students[_id] = Student(_id, _name);
        studentIds.push(_id);
    }

    function removeStudent(uint _id) public onlyAdmin {
        require(students[_id].id != 0, "Student does not exist");
        delete students[_id];
        
        for (uint i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _id) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }
    }

    function getStudentById(uint _id) public view returns (string memory) {
        require(students[_id].id != 0, "Student does not exist");
        return students[_id].name;
    }

    function getAllStudents() public view returns (Student[] memory) {
        Student[] memory studentList = new Student[](studentIds.length);
        for (uint i = 0; i < studentIds.length; i++) {
            studentList[i] = students[studentIds[i]];
        }
        return studentList;
    }
}
