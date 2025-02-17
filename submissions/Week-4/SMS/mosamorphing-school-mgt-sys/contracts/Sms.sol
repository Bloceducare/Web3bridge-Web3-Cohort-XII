// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;

contract SmsContract {
    address public principal;
    mapping(address => bool) public staffInfo;
    mapping(address => string) public studentInfo; 
    mapping(address => uint256) public studentFees;

    constructor() {
    principal = msg.sender; // contract deployer
}
    // principal can add a new staff
    function addStaff(address _staff) public {
        if (msg.sender != principal) {
            revert("ONLY THE PRINCIPAL CAN ADD A STAFF");
        }
        staffInfo[_staff] = true; //
    }

    // staff can add a new student
    function addStudent(address _student, string memory _name) public {
        if (!staffInfo[msg.sender]) {
            revert("ONLY STAFF CAN ADD STUDENTS");
        }
        studentInfo[_student] = _name; //
    }

    // students pay school fees
    function payFees() public payable {
        if (bytes(studentInfo[msg.sender]).length == 0) {
            revert("ONLY REGISTERED STUDENTS CAN PAY SCHOOL FEES"); //
        }
        studentFees[msg.sender] += msg.value;
    }

        // students can check their record
        function StudentRecord() public view returns (string memory, uint256) {
            if (bytes(studentInfo[msg.sender]).length == 0) {
                revert("ONLY REGISTERED STUDENTS CAN CHECK THEIR RECORD");
            }
            return (studentInfo[msg.sender], studentFees[msg.sender]); // this retuns name and fees paid
        }
    }