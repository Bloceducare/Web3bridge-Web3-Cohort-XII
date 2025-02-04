// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClassRegistry {

    address public admin;

    struct Student {      
        uint256 id;
        string name;
    }

    mapping(uint256 => Student) public students;

    event StudentRegistered(uint256 studentId, string name);
    event StudentRemoved(uint256 studentId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Register a student
    function registerStudent(uint256 _id, string memory _name) public onlyAdmin {
        require(bytes(students[_id].name).length == 0, "Student already registered");

        students[_id] = Student(_id, _name);
        emit StudentRegistered(_id, _name);
    }

    // Remove a student
    function removeStudent(uint256 _id) public onlyAdmin {
        require(bytes(students[_id].name).length != 0, "Student not found");
        delete students[_id];
        emit StudentRemoved(_id);
    }

    // Gets student by ID
    function getStudentById(uint256 _id) public view returns (uint256, string memory) {
        require(bytes(students[_id].name).length != 0, "Student not found");

        return (students[_id].id, students[_id].name);
    }
}
