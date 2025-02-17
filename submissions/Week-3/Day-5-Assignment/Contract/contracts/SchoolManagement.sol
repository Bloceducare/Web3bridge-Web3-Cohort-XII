// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SchoolManagement {
    struct Student{
        uint id;
        string name;
        uint256 age;
        bool added;
        uint256 confirmed;
    }

    address public user;
    mapping(uint256 => bool) private added;
    Student[] public eachStudent;
    

    constructor(address _owner) {
        user = _owner;
    }

    modifier teacher()  {
        require(msg.sender != address(0), "Address zero not allowed");
        require(msg.sender == user, "You are not the teacher");
        _;
    }

    function addStudent(uint256 _id, string memory name, uint256 _age) public teacher {
        eachStudent.push(Student(_id, name, _age, true, 0));
    }

    function studentAdded(uint256 id) public teacher returns(bool){
        Student storage students = eachStudent[id];
        students.confirmed += 1;
        return added[id] = true;
    }

    function getStudent(uint id) public view returns(string memory, uint){
        Student storage students = eachStudent[id];
        return (students.name, students.age);
    }

    function updateStudent(uint id, string calldata updateName, uint256 updateAge) public {
        Student storage students = eachStudent[id];
        students.name = updateName;
        students.age = updateAge;
    }
}