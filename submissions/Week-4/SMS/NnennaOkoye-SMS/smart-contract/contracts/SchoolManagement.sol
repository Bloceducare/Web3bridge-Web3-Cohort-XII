// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract SchoolManagement {
    address public immutable principal;
    uint32 public totalStudents;
    uint8 public totalTeachers;
    uint256 public tuitionFee;
    uint32 public activeStudentsCount;

    mapping(address => Student) public students;
    mapping(address => Teacher) public teachers;

    address[] public studentAddresses;
    address[] public teacherAddresses;

    enum PaymentStatus {
        Pending,
        Paid
    }
    
    enum Gender {
        Male,
        Female
    }

    struct Student {
        string name;
        uint32 age;
        uint32 id;
        PaymentStatus paymentStatus;
        Gender gender;
    }

    struct Teacher {
        string name;
        uint32 age;
        Gender gender;
    }

    event StudentAdded(address indexed studentAddress, string name);
    event TeacherAdded(address indexed teacherAddress, string name);
    event TuitionFeePaid(address indexed studentAddress, string name, uint256 fee);
    event TuitionFeeSet(uint256 indexed fee);
    event TeacherRemoved(address indexed teacherAddress, string name);
    event StudentRemoved(address indexed studentAddress, string name);

    constructor() {
        principal = msg.sender;
    }

    modifier onlyPrincipal() {
        require(msg.sender == principal, "Access restricted to principal");
        _;
    }

    modifier teachersAndPrincipal() {
        require(msg.sender == principal || teachers[msg.sender].age != 0, "Only teachers or principal allowed");
        _;
    }

    function setTuitionFee(uint256 _fee) public onlyPrincipal {
        tuitionFee = _fee;
    }

    function addTeacher(address _addr, string memory _name, uint32 _age, Gender _gender) public onlyPrincipal {
        require(teachers[_addr].age == 0, "Teacher already exists");
        totalTeachers++;
        teachers[_addr] = Teacher(_name, _age, _gender);
        teacherAddresses.push(_addr);
        emit TeacherAdded(_addr, _name);
    }

    function addStudent(address _addr, string memory _name, uint32 _age, Gender _gender) public teachersAndPrincipal {
        require(students[_addr].age == 0, "Student already exists");
        
        students[_addr] = Student(_name, _age, totalStudents, PaymentStatus.Pending, _gender);
        totalStudents++;
        studentAddresses.push(_addr);
        emit StudentAdded(_addr, _name);
    }

    function removeTeacher(address _addr) public onlyPrincipal {
        require(teachers[_addr].age != 0, "Teacher not found");
        totalTeachers--;
        delete teachers[_addr];
        for (uint i = 0; i < teacherAddresses.length; i++) {
            if (teacherAddresses[i] == _addr) {
                teacherAddresses[i] = teacherAddresses[teacherAddresses.length - 1];
                teacherAddresses.pop();
                break;
            }
        }
        emit TeacherRemoved(_addr, teachers[_addr].name);
    }

    function removeStudent(address _addr) public teachersAndPrincipal {
        require(students[_addr].age != 0, "Student not found");
        totalStudents--;
        delete students[_addr];
        for (uint i = 0; i < studentAddresses.length; i++) {
            if (studentAddresses[i] == _addr) {
                studentAddresses[i] = studentAddresses[studentAddresses.length - 1];
                studentAddresses.pop();
                break;
            }
        }
        emit StudentRemoved(_addr, students[_addr].name);
    }

    function payTuitionFee() public payable {
        require(students[msg.sender].age != 0, "Student not found");
        require(students[msg.sender].paymentStatus == PaymentStatus.Pending, "Fee already paid");
        require(msg.value == tuitionFee, "Incorrect amount");
        students[msg.sender].paymentStatus = PaymentStatus.Paid;
        activeStudentsCount++;
        emit TuitionFeePaid(msg.sender, students[msg.sender].name, msg.value);
    }

    function getBalance() public view returns(uint balance){
        balance = address(this).balance;
    }

    function getStudent(address _addr) public view returns (Student memory) {
        return students[_addr];
    }

    function getTeacher(address _addr) public view returns (Teacher memory) {
        return teachers[_addr];
    }

    function withdraw() public onlyPrincipal {
        payable(principal).transfer(address(this).balance);
    }
}
