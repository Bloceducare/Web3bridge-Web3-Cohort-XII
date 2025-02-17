// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SchoolManagement {
    address public principal;

    // Struct for staff and students
    struct Staff {
        string name;
        uint256 id;
        bool isActive;
    }

    //error codes
    error Unauthorized();
    error notFound();

    struct Student {
        string name;
        uint256 id;
        uint256 feesPaid;
    }

    // Mappings for staff and students
    mapping(uint256 => Staff) public staffRegistry;
    mapping(uint256 => Student) public studentRegistry;

    // Staff counter and student counter
    uint256 public staffCounter;
    uint256 public studentCounter;

    // Events for logging actions
    event StaffAdded(uint256 staffId, string name);
    event StaffRemoved(uint256 staffId);
    event StudentAdded(uint256 studentId, string name);
    event StudentRemoved(uint256 studentId);
    event FeesPaid(address student, uint256 amount);

    // Modifier to restrict certain functions to the principal
    modifier onlyPrincipal() {
        require(
            msg.sender == principal,
            "Only the principal can perform this action"
        );
        _;
    }

    // Modifier to restrict certain functions to staff
    modifier onlyStaff(uint256 staffId) {
        require(
            staffRegistry[staffId].isActive,
            "Only an active staff can perform this action"
        );
        _;
    }

    // Constructor: Set the principal
    constructor() {
        principal = msg.sender;
    }

    // Principal can add a new staff member
    function addStaff(string memory _name) public onlyPrincipal {
        staffCounter++;
        staffRegistry[staffCounter] = Staff(_name, staffCounter, true);
        emit StaffAdded(staffCounter, _name);
    }

    // Principal can remove a staff member
    function removeStaff(uint256 staffId) public onlyPrincipal {
        require(staffRegistry[staffId].isActive, notFound());
        staffRegistry[staffId].isActive = false;
        emit StaffRemoved(staffId);
    }

    // Staff can add a new student
    function addStudent(string memory _name) public onlyStaff(1) {
        // Using staffId = 1 as example
        studentCounter++;
        studentRegistry[studentCounter] = Student(_name, studentCounter, 0);
        emit StudentAdded(studentCounter, _name);
    }

    // Staff can remove a student
    function removeStudent(uint256 studentId) public onlyStaff(1) {
        // Using staffId = 1 as example
        require(studentRegistry[studentId].id != 0, "Student does not exist");
        delete studentRegistry[studentId];
        emit StudentRemoved(studentId);
    }

    // Students can pay fees to the principal
    function payFees() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        Student storage student = studentRegistry[studentCounter];
        student.feesPaid += msg.value;
        payable(principal).transfer(msg.value);
        emit FeesPaid(msg.sender, msg.value);
    }

    // View details of a student
    function getStudentDetails(
        uint256 studentId
    ) public view returns (string memory, uint256, uint256) {
        require(studentRegistry[studentId].id != 0, "Student does not exist");
        Student memory student = studentRegistry[studentId];
        return (student.name, student.id, student.feesPaid);
    }

    // View details of a staff member
    function getStaffDetails(
        uint256 staffId
    ) public view returns (string memory, uint256, bool) {
        require(staffRegistry[staffId].isActive, "Staff does not exist");
        Staff memory staff = staffRegistry[staffId];
        return (staff.name, staff.id, staff.isActive);
    }
}
