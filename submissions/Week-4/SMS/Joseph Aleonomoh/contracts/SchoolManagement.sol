// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SchoolManagement {

    enum Gender {
        Male,
        Female
    }

    enum Class {
        Jss1,
        Jss2,
        Jss3,
        Sss1,
        Sss2,
        Sss3
    }

    struct TeacherDetails {
        string name;
        uint32 age;
        Class class;
        Gender gender;
        address _address;
        uint256 created;
    }

    struct StudentDetails {
        string name;
        uint32 age;
        Class class;
        Gender gender;
        address _address;
        bool isPaid;
        uint256 created;
    }

    // state variables
    address public principal;
    uint256 public teacher_count;
    uint256 public student_count;
    uint256 public feeAmount;
    uint256 studentID;
    uint256 teacherID;


    mapping(uint256 => TeacherDetails) public teachers;
    mapping(uint256 => StudentDetails) public students;
    mapping(address => bool) public isTeacher;

    constructor(uint256 _feeAmount) {
        principal = msg.sender;
        isTeacher[msg.sender] = true;
        feeAmount = _feeAmount;
    }

    modifier onlyPrincipal() {
        require(
            msg.sender != principal,
            "UNAUTHORIZED!!! Only Principal can access"
        );
        _;
    }

    modifier onlyTeacher() {
        require(isTeacher[msg.sender] == true, "User not Admin");
        _;
    }

    modifier onlyStudent(uint _studentId) {
        require(students[_studentId].age > 0, "Not a student");
        _;
    }

    event TeacherRegistered(string name, Class class);
    event StudentRegistered(uint256 _studentId, string _name, Class _class);
    event TeacherRemoved(string _name, Class _class);
    event StudentRemoved(uint256 _studentId, string _name, Class _class);
    event FeesPaid(uint256 _id, uint256 _amount);
    event PrincipalChanged(address _address);

    function changePrincipal(address _address) external onlyPrincipal {
        require(_address != address(0), "Address not Valid");
        principal = _address;
        emit PrincipalChanged(_address);
    }

    function registerTeacher(
        string memory _name,
        uint32 _age,
        Class _class,
        Gender _gender,
        address __address
    ) external onlyPrincipal {
        uint256 _teacherId = teacherID + 1;

        TeacherDetails memory teacher = TeacherDetails({
            name: _name,
            age: _age,
            class: _class,
            gender: _gender,
            _address: __address,
            created: block.timestamp
        });

        teachers[_teacherId] = teacher;
        isTeacher[__address] = true;
        teacher_count++;
        teacherID++;
        emit TeacherRegistered(_name, _class);
    }

    function removeTeacher(uint256 _teacherId) external onlyPrincipal {
        require(
            isTeacher[teachers[_teacherId]._address] == true,
            "Teacher does not exist"
        );
        string memory _name = teachers[_teacherId].name;
        Class _class = teachers[_teacherId].class;

        delete isTeacher[teachers[_teacherId]._address];
        delete teachers[_teacherId];
        teacher_count -= 1;

        emit TeacherRemoved(_name, _class);
    }

    function registerStudent(
        string memory _name,
        uint32 _age,
        Class _class,
        Gender _gender,
        address __address,
        bool _isPaid
    ) external onlyTeacher {
        StudentDetails memory student = StudentDetails({
            name: _name,
            age: _age,
            class: _class,
            gender: _gender,
            _address: __address,
            isPaid: _isPaid,
            created: block.timestamp
        });
        uint256 _studentId = studentID + 1;

        students[_studentId] = student;
        student_count++;
        studentID++;
        emit StudentRegistered(_studentId, _name, _class);
    }

    function removeStudent(uint256 _studentId) external onlyTeacher {
        require(students[_studentId].age != 0, "Student Does not Exist");
        string memory _name = students[_studentId].name;
        Class _class = students[_studentId].class;
        delete students[_studentId];
        student_count -= 1;

        emit StudentRemoved(_studentId, _name, _class);
    }

    function payFees(
        uint256 _studentId
    ) external payable onlyStudent(_studentId) {
        require(
            students[_studentId].isPaid != true,
            "Student already paid fees"
        );
        require(
            msg.value == feeAmount * (10e18),
            "School Fees Not Complete, 2 ethers required"
        );
        StudentDetails memory student = students[_studentId];
        student.isPaid = true;
        emit FeesPaid(_studentId, feeAmount);
    }

    function withdraw() external onlyPrincipal payable {
        require(address(this).balance > 0, "Balance is empty");
        payable(principal).transfer(address(this).balance);
    }

    function payTeacher(
        uint256 _teacherId,
        uint256 amount
    ) external onlyPrincipal payable {
        require(teachers[_teacherId]._address != address(0));
        require(address(this).balance > 0, "Balance is empty");
        require(
            isTeacher[teachers[_teacherId]._address] == true,
            "Not a Teacher"
        );
        payable(teachers[_teacherId]._address).transfer(amount * (10e18));
    }

    function isPaid(uint256 _studentId) external view returns (bool) {
        require(students[_studentId].age > 0, "Student does not exist");
        return students[_studentId].isPaid;
    }

    function getBalance() external view onlyPrincipal returns (uint256) {
        return address(this).balance;
    }

    function updateFees(uint256 _feeAmount) external onlyPrincipal {
        require(_feeAmount > 0, "Not Valid Input");
        feeAmount = _feeAmount;
    }
}
