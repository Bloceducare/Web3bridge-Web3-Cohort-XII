// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ClassRegistration {
    address public admin;

    struct Student {
        uint256 id;
        string name;
        bool isRegistered;
    }

    mapping(uint256 => Student) public students;
    uint256[] public studentIds;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(uint256 _id, string memory _name) public onlyAdmin {
        require(!students[_id].isRegistered, "Student already registered");
        students[_id] = Student(_id, _name, true);
        studentIds.push(_id);
    }

    function removeStudent(uint256 _id) public onlyAdmin {
        require(students[_id].isRegistered, "Student not found");
        delete students[_id];

        // Remove ID from studentIds array
        for (uint256 i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _id) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }
    }

    function getStudent(uint256 _id) public view returns (string memory) {
        require(students[_id].isRegistered, "Student not found");
        return students[_id].name;
    }

    function getAllStudents() public view returns (uint256[] memory) {
        return studentIds;
    }
}
