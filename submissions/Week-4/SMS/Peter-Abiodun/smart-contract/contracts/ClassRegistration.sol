// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClassRegistration {
    address public admin;
    uint public studentCount = 0;

    struct Student {
        uint id;
        string name;
    }

    mapping(uint => Student) public students;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(string memory _name) public onlyAdmin {
        studentCount++;
        students[studentCount] = Student(studentCount, _name);
    }

    function removeStudent(uint _id) public onlyAdmin {
        require(_id > 0 && _id <= studentCount, "Invalid student ID");
        delete students[_id];
    }

    function getStudent(uint _id) public view returns (Student memory) {
        require(_id > 0 && _id <= studentCount, "Invalid student ID");
        Student memory student = students[_id];
        return student;
    }
}
