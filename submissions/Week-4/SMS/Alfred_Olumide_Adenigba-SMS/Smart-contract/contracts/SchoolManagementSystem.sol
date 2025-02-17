// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SchoolManagementSystem {
    address public principal;
    uint256 public tuitionFee;
    uint256 public studentCount;
    uint256 public courseCount;
    
    
    struct Student {
        uint256 id;
        string name;
        uint16 age;
        bool isRegistered;
        bool hasPaidTuition;
        address studentAddress;
    }
    
    struct Course {
        uint256 courseId;
        string courseName;
    }
    
    mapping(address => bool) public staff;
    mapping(uint256 => Student) private students;
    mapping(uint256 => Course) public courses;
    mapping(uint256 => mapping(uint256 => bool)) public studentCourses;
    
    
    event TuitionFeeSet(uint256 newFee);
    event StaffAdded(address indexed staffAddress);
    event StaffRemoved(address indexed staffAddress);
    event StudentRegistered(uint256 indexed studentId, string name);
    event StudentRemoved(uint256 indexed studentId);
    event FeesPaid(address indexed student, uint256 amount);
    event CourseAdded(uint256 indexed courseId, string courseName);
    event CourseRegistered(uint256 indexed studentId, uint256 indexed courseId);
    event FundsWithdrawn(address indexed principal, uint256 amount, uint256 balance);
    event SalaryPaid(address indexed staff, uint256 amount);

    modifier onlyPrincipal() {
        require(msg.sender == principal, "Only Principal Allowed");
        _;
    }
    
    modifier onlyStaff() {
        require(staff[msg.sender], "Not staff");
        _;
    }
    
    constructor() {
        principal = msg.sender;
        staff[principal] = true;
    }

    function setTuitionFee(uint256 _fee) external onlyPrincipal {
        require(_fee > 0, "Tuition fee must be greater than 0");
        tuitionFee = _fee;
        emit TuitionFeeSet(_fee);
    }

    function addStaff(address _staffAddr) external onlyPrincipal {
        require(!staff[_staffAddr], "Already staff");
        staff[_staffAddr] = true;
        emit StaffAdded(_staffAddr);
    }

    function removeStaff(address _staffAddr) external onlyPrincipal {
        require(staff[_staffAddr], "Not staff");
        staff[_staffAddr] = false;
        emit StaffRemoved(_staffAddr);
    }

    function registerStudent( string memory _name, uint16 _age, address _studentAddr ) external onlyStaff {  
        require(tuitionFee > 0, "Tuition fee not set");
        
        uint256 _id = ++studentCount ;
        
        require(_studentAddr != address(0), "Invalid address");
        require(!students[_id].isRegistered, "Student exists");
        
        students[_id] = Student(_id, _name, _age, true, false, _studentAddr);

        studentCount = _id;
        
        emit StudentRegistered(_id, _name);
    }

     // Function to remove student
    function removeStudent(uint256 _studentId) external onlyPrincipal {
        require(students[_studentId].isRegistered, "Student not found");
        delete students[_studentId];
        studentCount--;
        emit StudentRemoved(_studentId);
    }

    function payTuition(uint256 _studentId) external payable {
        require(students[_studentId].isRegistered, "Not registered");
        Student storage student = students[_studentId];        
        require(msg.sender == student.studentAddress, "Not student");
        require(msg.sender.balance >= tuitionFee, "Insufficient balance");
        require(!student.hasPaidTuition, "Already paid");
        require(msg.value == tuitionFee, "Incorrect amount");
        (bool success, ) = address(this).call{value: msg.value}("");
        require(success, "Transfer failed");
        student.hasPaidTuition = true;
        emit FeesPaid(msg.sender, msg.value);
    }

    function addCourse( string memory _name) external onlyStaff {

        uint256 _courseId = ++courseCount ;

        require(courses[_courseId].courseId == 0, "Course exists");
        courses[_courseId] = Course(_courseId, _name);

        courseCount = _courseId;
        emit CourseAdded(_courseId, _name);
    }

    function registerForCourse(uint256 _studentId, uint256 _courseId) external {
        require(students[_studentId].isRegistered, "Student not registered");
        require(students[_studentId].hasPaidTuition, "No tuition Paid");
        Student storage student = students[_studentId];
        Course storage course = courses[_courseId];
        
        require(msg.sender == student.studentAddress, "Not student");
        require(course.courseId != 0, "Course doesn't exist");
        require(!studentCourses[_studentId][_courseId], "Already registered");
        
        studentCourses[_studentId][_courseId] = true;
        emit CourseRegistered(_studentId, _courseId);
    }

    // Get student details by ID (Only Principal)
    function getStudent(uint256 _studentId) external view onlyPrincipal returns ( uint256 id, string memory name,uint16 age, bool isRegistered, bool hasPaidTuition, address studentAddress) {
    require(students[_studentId].isRegistered, "Student not found");
    Student storage student = students[_studentId];
    return ( student.id, student.name, student.age, student.isRegistered, student.hasPaidTuition, student.studentAddress);
    }

    // Function to withdraw funds from the contract
    function withdrawFunds(uint256 _amount) external onlyPrincipal {
        uint256 balance = address(this).balance;
        require(balance > 0, "Insufficient funds");
        require(_amount <= balance, "Exceeds balance");
        payable(principal).transfer(_amount);

        uint256 newBalance = address(this).balance;
        emit FundsWithdrawn(principal, _amount, newBalance);
    }

    // Function to pay staff salary
    function paySalary(address _staffAddr, uint256 _amount) external onlyPrincipal {
        require(staff[_staffAddr], "Not a staff");
        require(_amount > 0 && _amount <= address(this).balance, "Invalid amount");
        payable(_staffAddr).transfer(_amount);
        emit SalaryPaid(_staffAddr, _amount);
    }

    // Function to check contract balance
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    receive() external payable {}
}