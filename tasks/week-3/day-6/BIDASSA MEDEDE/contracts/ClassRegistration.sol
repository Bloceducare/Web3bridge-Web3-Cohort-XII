// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ClassRegistration {
    address public admin;

    struct Student {
        uint id;
        string name;
        bool isRegistered;
    }

    mapping(uint => Student) private students;
    uint[] private studentIds;

    event StudentRegistered(uint studentId, string name);
    event StudentRemoved(uint studentId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(uint _id, string calldata _name) external onlyAdmin {
        require(!students[_id].isRegistered, "Student ID already registered");
        require(bytes(_name).length > 0, "Student name is required");

        students[_id] = Student(_id, _name, true);
        studentIds.push(_id);

        emit StudentRegistered(_id, _name);
    }

    function removeStudent(uint _id) external onlyAdmin {
        require(students[_id].isRegistered, "Student not found");

        delete students[_id];

        // Remove student ID from the list
        for (uint i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _id) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }

        emit StudentRemoved(_id);
    }

    function getStudentById(uint _id) external view returns (string memory) {
        require(students[_id].isRegistered, "Student not found");
        return students[_id].name;
    }

    function getAllStudents() external view returns (uint[] memory, string[] memory) {
        string[] memory names = new string[](studentIds.length);

        for (uint i = 0; i < studentIds.length; i++) {
            names[i] = students[studentIds[i]].name;
        }

        return (studentIds, names);
    }
}
