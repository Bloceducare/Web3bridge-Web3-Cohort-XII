// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClassRegister {
    address public admin;
    uint256 private nextId;

    struct Student {
        uint256 id;
        string name;
        bool deleted;
    }

    mapping(uint256 => Student) public students;
    uint256[] private studentIds;  // Store active student IDs

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    function registerStudent(string calldata name) public onlyAdmin {
        students[nextId] = Student(nextId, name, false);
        studentIds.push(nextId);
        nextId++;
    }

    function deleteStudent(uint256 _id) public onlyAdmin {
        require(!students[_id].deleted, "Student already deleted");
        students[_id].deleted = true;
    }

    function allStudents() public view returns (Student[] memory) {
        uint256 activeCount;
        for (uint256 i = 0; i < studentIds.length; i++) {
            if (!students[studentIds[i]].deleted) {
                activeCount++;
            }
        }

        Student[] memory activeStudents = new Student[](activeCount);
        uint256 index;
        for (uint256 i = 0; i < studentIds.length; i++) {
            if (!students[studentIds[i]].deleted) {
                activeStudents[index] = students[studentIds[i]];
                index++;
            }
        }

        return activeStudents;
    }
}
