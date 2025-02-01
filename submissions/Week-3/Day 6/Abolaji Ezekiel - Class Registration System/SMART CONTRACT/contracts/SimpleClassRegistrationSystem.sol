// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleClassRegistrationSystem {
    address  admin;
    uint256 studentCount;
    
    struct Student {
        uint256 id;
        string name;
        bool isRegistered;
    }
    
    mapping(uint256 => Student) private students;
    uint256[] private studentIds;
    
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
        require(!students[_id].isRegistered, "Student already registered");
        students[_id] = Student(_id, _name, true);
        studentIds.push(_id);
        studentCount++;
        emit StudentRegistered(_id, _name);
    }
    
    function removeStudent(uint256 _id) public onlyAdmin {
        require(students[_id].isRegistered, "Student not found");
        delete students[_id];
        studentCount--;
        emit StudentRemoved(_id);
    }
    
    function getStudent(uint256 _id) public view returns (uint256, string memory) {
        require(students[_id].isRegistered, "Student not found");
        Student memory student = students[_id];
        return (student.id, student.name);
    }
    
    function getAllStudents() public view returns (Student[] memory) {
        Student[] memory allStudents = new Student[](studentIds.length);
        uint256 count = 0;
        for (uint256 i = 0; i < studentIds.length; i++) {
            uint256 id = studentIds[i];
            if (students[id].isRegistered) {
                allStudents[count] = students[id];
                count++;
            }
        }
        assembly { mstore(allStudents, count) }
        return allStudents;
    }
}
