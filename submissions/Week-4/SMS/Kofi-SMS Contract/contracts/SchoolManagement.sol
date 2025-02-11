// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SchoolManagement {

    address public owner;
    uint public feeAmount = 1 ether;

    enum Fees {
        pending, paid
    }

    struct Teacher {
        uint teacherId;
        string teacherName;
    }

    struct Student {
        uint studentId;
        string studentName;
        string gender;
        bool paid;
    }

    mapping(uint => Student) public students;
    mapping(uint => Teacher) public teachers;
    uint public studentCount;
    uint public teacherCount;
    uint public totalFeesCollected;

    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You must be the owner");
        _;
    }

    event teacherAdded(uint256 teacherId, string teacherName);
    event StudentAdded(uint256 studentId, string studentName, string gender);
    event FeesPaid(uint256 studentId, uint256 feeAmount);
    event Withdrawn(uint256 amount);

    function addTeacher(uint256 _teacherId, string memory _teacherName) external onlyOwner {
        // require(teachers[_teacherId].id == 0, 'A Teacher with that ID Already Exist');
        teacherCount += 1;
        teachers[teacherCount] = Teacher( _teacherId, _teacherName);
        emit teacherAdded( _teacherId, _teacherName);
    }

    function addStudent(uint256 _studentId, string memory _studentName, string memory _gender) public onlyOwner {
        studentCount += 1;
        students[_studentId] = Student(_studentId, _studentName, _gender, false);
        emit StudentAdded(_studentId, _studentName, _gender);
    }

    function payFees(uint _studentId) public payable {
        require(students[_studentId].studentId == _studentId, "Invalid student ID");
        Student storage student = students[_studentId];
        require(msg.value == feeAmount, "fees must be 1 ether");
        require(!student.paid, "You have paid fees");
        
        student.paid = true;
        totalFeesCollected += msg.value;
        
        emit FeesPaid(_studentId, msg.value);
    }

    function withdraw() public onlyOwner {
        uint amountToWithdraw = totalFeesCollected;
        require(amountToWithdraw > 0, "No Money in the aza");

        totalFeesCollected = 0; // Reset total fees before transfer
        payable(owner).transfer(amountToWithdraw); // Transfer to owner
        emit Withdrawn(amountToWithdraw);
    }
}
