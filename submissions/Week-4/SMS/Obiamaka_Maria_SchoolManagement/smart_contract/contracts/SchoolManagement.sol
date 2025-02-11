// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SchoolManagement {
    address public principal;
    uint256 public constant FEE_AMOUNT = 0.1 ether;

    enum FeeStatus {
        NotPaid,
        Paid
    }

    struct Teacher {
        uint256 id;
        address teacherAddress;
        string name;
        bool isRegistered;
    }

    struct Student {
        uint256 id;
        address studentAddress;
        string name;
        FeeStatus feeStatus;
        bool isRegistered;
    }

    mapping(uint256 => Teacher) public teachers;
    mapping(uint256 => Student) public students;
    mapping(address => bool) public isTeacher;
    uint256 private teacherCount;
    uint256 private studentCount;

    modifier onlyPrincipal() {
        require(
            msg.sender == principal,
            "Only the principal can perform this action"
        );
        _;
    }

    modifier onlyTeacherOrPrincipal() {
        require(
            msg.sender == principal || isTeacher[msg.sender],
            "Only a teacher or the principal can perform this action"
        );
        _;
    }

    //events
    event studentRegistered(uint256, string);
    event teacherRegistered(uint256, string);

    constructor() {
        principal = msg.sender;
    }

    function registerTeacher(
        address _teacher,
        string memory _name
    ) external onlyPrincipal {
        require(!isTeacher[_teacher], "Teacher is already registered");
        teacherCount++;
        teachers[teacherCount] = Teacher(teacherCount, _teacher, _name, true);
        isTeacher[_teacher] = true;
        emit teacherRegistered(teacherCount, _name);
    }

    function registerStudent(
        address _student,
        string memory _name
    ) external onlyTeacherOrPrincipal {
        studentCount++;
        students[studentCount] = Student(
            studentCount,
            _student,
            _name,
            FeeStatus.NotPaid,
            true
        );
        emit studentRegistered(studentCount, _name);
    }

    function checkFeeStatus(
        uint256 _studentId
    ) external view returns (FeeStatus) {
        require(students[_studentId].isRegistered, "Student is not registered");
        return students[_studentId].feeStatus;
    }

    function payFees(uint256 _studentId) external payable {
        require(students[_studentId].isRegistered, "Student is not registered");
        require(
            students[_studentId].studentAddress == msg.sender,
            "You can only pay your own fees"
        );
        require(msg.value == FEE_AMOUNT, "Incorrect fee amount");
        require(
            students[_studentId].feeStatus == FeeStatus.NotPaid,
            "Fees already paid"
        );

        students[_studentId].feeStatus = FeeStatus.Paid;
        payable(principal).transfer(msg.value);
    }

    function getTeacher(
        uint256 _teacherId
    ) external view returns (Teacher memory) {
        require(teachers[_teacherId].isRegistered, "Teacher not found");
        return teachers[_teacherId];
    }

    function getStudent(
        uint256 _studentId
    ) external view returns (Student memory) {
        require(students[_studentId].isRegistered, "Student not found");
        return students[_studentId];
    }
}
