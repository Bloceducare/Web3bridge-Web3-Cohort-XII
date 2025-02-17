// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract SchoolManagement {
    address public owner;
    
enum Gender {
        Male,
        Female
    }

    struct Teacher {
        string name;
        uint32 age;
        string classAssigned;
        Gender gender;
        address teacherAddress;
    }

    struct StudentDetails {
        string name;
        uint32 age;
        string classEnrolled;
        Gender gender;
        address studentAddress;
        bool hasPaidFees;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => StudentDetails) public students;
    mapping(string => uint256) public classFees;

    event TeacherAdded(address indexed teacherAddress, string name);
    event StudentAdded(address indexed studentAddress, string name);
    event FeePaid(address indexed studentAddress, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY THE OWNER CAN PERFORM THIS ACTION");
        _;
    }

    modifier onlyTeacher() {
        require(teachers[msg.sender].teacherAddress != address(0), "ONLY TEACHERS CAN PERFORM THIS ACTION");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addTeacher(address _teacherAddress, string memory _name, uint32 _age, string memory _classAssigned, Gender _gender) external onlyOwner {
        teachers[_teacherAddress] = Teacher(_name, _age, _classAssigned, _gender, _teacherAddress);
        emit TeacherAdded(_teacherAddress, _name);
    }

    function addStudent(address _studentAddress, string memory _name, uint32 _age, string memory _classEnrolled, Gender _gender) external onlyTeacher {
        students[_studentAddress] = StudentDetails(_name, _age, _classEnrolled, _gender, _studentAddress, false);
        emit StudentAdded(_studentAddress, _name);
    }

    function setClassFee(string memory _class, uint256 _fee) external onlyOwner {
        classFees[_class] = _fee;
    }

    function paySchoolFees() external payable {
        require(students[msg.sender].studentAddress != address(0), "STUDENT NOT REGISTERED");
        uint256 feeAmount = classFees[students[msg.sender].classEnrolled];
        require(msg.value == feeAmount, "INCORRECT SCHOOL FEES AMOUNT");
        students[msg.sender].hasPaidFees = true;
        emit FeePaid(msg.sender, msg.value);
    }

    function checkFeeStatus(address _studentAddress) external view returns (bool) {
        return students[_studentAddress].hasPaidFees;
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}