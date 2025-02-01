// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClassRegistration {
    address public admin;
    uint256 public studentCount;
    
    struct Student {
        uint256 id;
        string name;
        bool isRegistered;
    }

    mapping(uint256 => Student) public students;
    uint256[] public studentIds;
    
    event StudentRegistered(uint256 id, string name);
    event StudentRemoved(uint256 id);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(uint256 _id, string memory _name) public onlyAdmin {
        require(!students[_id].isRegistered, "Student ID already registered");
        students[_id] = Student(_id, _name, true);
        studentIds.push(_id);
        studentCount++;
        emit StudentRegistered(_id, _name);
    }
    
    function removeStudent(uint256 _id) public onlyAdmin {
        require(students[_id].isRegistered, "Student ID not found");
        delete students[_id];
        studentCount--;
        emit StudentRemoved(_id);
    }
    
    function getStudentById(uint256 _id) public view returns (string memory, bool) {
        require(students[_id].isRegistered, "Student ID not found");
        return (students[_id].name, students[_id].isRegistered);
    }
    
    function getAllStudents() public view returns (Student[] memory) {
        Student[] memory registeredStudents = new Student[](studentIds.length);
        for (uint256 i = 0; i < studentIds.length; i++) {
            uint256 id = studentIds[i];
            if (students[id].isRegistered) {
                registeredStudents[i] = students[id];
            }
        }
        return registeredStudents;
    }
}
