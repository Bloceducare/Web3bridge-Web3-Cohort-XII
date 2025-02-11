// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract School {
    address public principal;
    string public nameOfSchool; 
    uint256 public schoolFeesAmount;

    //Events
     event teacherAdded (
        string _teacherName,
        string _subject
     );

     event teacherSacked ( 
        string _teacherName,
        string _subject
    );

     event studedntAdded (
        string _studentName,
        address _studentwalletAdress
    );

     event studentRemoved (
        string _studentName,
        address _studentwalletAdress
    );

     event feesPaid( 
        string _studentName,
        uint256 amount
    );

     event Withdrawn(
        uint256 amount,
        uint256 time
    );

    constructor(string memory _nameOfSchool, uint256 _schoolFeesAmount) {
        principal = msg.sender;
        nameOfSchool = _nameOfSchool;
        schoolFeesAmount = _schoolFeesAmount;
    }

    modifier onlyPrincipal() {
        require(msg.sender == principal, "You are not the Principal");
        _; 
    }

    modifier onlyPrincipalOrTeacher() {
        require(msg.sender == principal || teachers[teacherId[msg.sender]].isRegistered, "You are not the Principal or a Teacher");
        _;   
    }

    modifier onlyStudent() {
        require(students[StudentsId[msg.sender]].isRegistered, "Only Students are required to pay school fees");
        _;
    }

    function withdraw() public onlyPrincipal {
        uint256 _contractBal = address(this).balance;
        payable(msg.sender).transfer(address(this).balance);
        emit Withdrawn(_contractBal, block.timestamp);
    }

    enum feesStatus {
        NotPaid,
        Paid
        }

    struct Teachers {
        uint256 id;
        string teacherName;
        string subject;
        bool isRegistered; 
    }
    mapping (address => uint256) public teacherId;
    mapping (uint256 => Teachers) public teachers;

    function addTeacher(uint256 _id, string memory _teacherName, string memory _subject) public onlyPrincipal {
        teachers[_id] = Teachers(_id, _teacherName, _subject, true);
        emit teacherAdded(_teacherName, _subject);
    }

    function sackTeacher(uint256 _id) public onlyPrincipal {
        require(teachers[_id].isRegistered, "Teacher is not registered");
        delete teachers[_id];
        emit teacherSacked(teachers[_id].teacherName, teachers[_id].subject);
    }

    function searchTeacherbyId(uint256 _id) public view returns (string memory, string memory) {
        return (teachers[_id].teacherName, teachers[_id].subject);
    }

    struct Students {
        uint256 id;
        string studentName;
        bool isRegistered;
        address studentwalletAddress;
        feesStatus paymentStatus;
    }
        
    mapping (address => uint256) public StudentsId;
    mapping (uint256 => Students) public students;

    function addStudent(uint256 _id, string memory _studentName, address _studentwalletAdress) public onlyPrincipalOrTeacher{
        require(!students[StudentsId[_studentwalletAdress]].isRegistered, "Student is already registered");
        students[_id] = Students(_id, _studentName, true, _studentwalletAdress, feesStatus.NotPaid);
        emit studedntAdded(_studentName, _studentwalletAdress);
    }

    function removeStudent(uint256 _id) public onlyPrincipalOrTeacher {
        require(students[_id].isRegistered, "You cant remove an unregistered Student");
        delete students[_id];
        emit studentRemoved(students[_id].studentName, students[_id].studentwalletAddress);
    }

    function searchStudentbyId(uint256 _id) public view returns (string memory, feesStatus) {
        return (students[_id].studentName, students[_id].paymentStatus);
    }

    function paySchoolFees(uint256 fees) public onlyStudent payable {
        uint256 _id = StudentsId[msg.sender];
        require(students[_id].isRegistered, "Student is not registered");
        require(students[_id].paymentStatus == feesStatus.NotPaid, "Student has already paid");
        require(fees == schoolFeesAmount, "Incorrect schoolFeesAmount set");
        students[_id].paymentStatus = feesStatus.Paid;
        emit feesPaid(students[_id].studentName, schoolFeesAmount);
    }
}