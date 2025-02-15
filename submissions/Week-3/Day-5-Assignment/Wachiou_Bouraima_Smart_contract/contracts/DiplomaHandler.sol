// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract DiplomaHandler {
    address public admin;
    mapping(address => Diploma) public diplomas;

    struct Diploma {
        string studentName;
        string courseName;
        uint256 issueDate;
    }

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    modifier notEmpty(string memory _string) {
        require(bytes(_string).length > 0, "Empty string is not allowed");
        _;
    }

    event DiplomaIssued(address indexed student, string studentName, string courseName);
    
    function issueDiploma(address student, string memory studentName, string memory courseName)
    public
    onlyAdmin
    notEmpty(studentName)
    notEmpty(courseName)
    {
        require(diplomas[student].issueDate == 0, "This diploma has already been issued" );

        diplomas[student] = Diploma({
            studentName: studentName,
            courseName: courseName,
            issueDate: block.timestamp

        });
        emit DiplomaIssued(student, studentName, courseName);
    }


function getDioploma(address student) public view returns (Diploma memory) {
    require(diplomas[student].issueDate != 0, "No Diploma was issued for this student");
    return diplomas[student];
}
}
