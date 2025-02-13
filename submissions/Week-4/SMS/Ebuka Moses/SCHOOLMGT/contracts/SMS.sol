// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract SMS {
    enum Gender {
        Male,
        Female
    }

    enum Class {
        js1,
        js2,
        js3,
        ss1,
        ss2,
        ss3
    }

    struct TeacherDetails {
        string name;
        uint32 age;
        Class class_;
        Gender gender;
        address _address;
        uint256 created;
    }

    struct StudentDetails {
        string name;
        uint32 age;
        Class class_;
        Gender gender;
        bool isPaid;
        address _address;
        uint256 created;
    }

    // State variables
    address public principal;
    uint256 public teacher_count;
    uint256 public student_count;
    uint256 public studentID;
    uint256 public teacherID;

    mapping(uint256 => TeacherDetails) public teachers;
    mapping(uint256 => StudentDetails) public students;
    mapping(address => bool) public isTeacher;
    
    // event TeacherRegistered(string name, Class class);
    // event StudentRegistered(uint256 _studentId, string _name, string _name, Class _class);
    // event FeesPaid(uint256 _id, uint256 _amount);
    constructor() {
        principal = msg.sender;
        isTeacher[msg.sender] = true;
    }

    modifier onlyPrincipal() {
        require(msg.sender == principal, "UNAUTHORIZED, Principal Only!");
        _;
    }

    modifier onlyTeacher() {
        require(isTeacher[msg.sender] == true, "User not an Admin");
        _;
    }

    function registerTeacher(
        string memory _name,
        uint32 _age,
        Class _class,
        Gender _gender,
        address _address
    ) external onlyPrincipal {
        uint256 _teacherId = teacherID + 1;

        teachers[_teacherId] = TeacherDetails({
            name: _name,
            age: _age,
            class_: _class,
            gender: _gender,
            _address: _address,
            created: block.timestamp
        });

        isTeacher[_address] = true;
        teacher_count++;
        teacherID++;
    }

    function removeTeacher(uint256 _teacherId) external onlyPrincipal {
        require(isTeacher[teachers[_teacherId]._address] == true, "Teacher does not exist");

        delete isTeacher[teachers[_teacherId]._address];
        delete teachers[_teacherId];
        teacher_count -= 1;
    }

    function registerStudent(
        string memory _name,
        uint32 _age,
        Class _class,
        Gender _gender,
        address _address,
        bool _isPaid
    ) external onlyPrincipal {
        uint256 _studentId = studentID + 1;

        students[_studentId] = StudentDetails({
            name: _name,
            age: _age,
            class_: _class,
            gender: _gender,
            _address: _address,
            isPaid: _isPaid,
            created: block.timestamp
        });

        student_count++;
        studentID++;
    }

    function removeStudent(uint256 _studentId) external onlyPrincipal {
        require(students[_studentId].age != 0, "No Student Found");

        delete students[_studentId];
        student_count -= 1;
    }

    function payFee(uint256 _studentId) external payable {
        require(students[_studentId].isPaid == false, "You have already paid");
        require(msg.value == 2 ether, "You need 2 ether to pay");

        students[_studentId].isPaid = true;
    }
    

    function withdraw() external onlyPrincipal {
            require(address(this).balance > 0, "Low Balance Account");
            payable(principal).transfer(address(this).balance);
        }
    
        function payTeacher(uint256 _teacherId, uint256 amount) external onlyPrincipal {
            require(teachers[_teacherId]._address != address(0));
            require(address(this).balance > 0, "Low Balance Account");
            require(isTeacher[teachers[_teacherId]._address] == true, "You are not a teacher");
            payable(teachers[_teacherId]._address).transfer(amount);
        }
    
}