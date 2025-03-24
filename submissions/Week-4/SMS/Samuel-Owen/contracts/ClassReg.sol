// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract ClassRegistration {
    address public admin;
    
    struct Student {
        uint256 id;
        string name;
        bool isRegistered;
        uint256 feesPaid;
    }
    
    struct Staff {
        address staffAddress;
        bool isRegistered;
    }

    mapping(uint256 => Student) private students;
    mapping(address => Staff) private staffMembers;
    uint256[] private studentIds;

    event StudentRegistered(uint256 id, string name);
    event StudentRemoved(uint256 id);
    event StaffAdded(address staff);
    event FeesPaid(uint256 studentId, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can open this!");
        _;
    }

    modifier onlyStaffOrAdmin() {
        require(msg.sender == admin || staffMembers[msg.sender].isRegistered, "Only admin or staff can open");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }

    // Only the admin can add staff
    function addStaff(address _staffAddress) external onlyAdmin {
        require(!staffMembers[_staffAddress].isRegistered, "Staff already exists");
        staffMembers[_staffAddress] = Staff(_staffAddress, true);
        emit StaffAdded(_staffAddress);
    }

    // Only the Admin or staff registers a student 
    function registerStudent(uint256 _id, string memory _name) external onlyStaffOrAdmin {
        require(!students[_id].isRegistered, "Student already registered");
        students[_id] = Student(_id, _name, true, 0);
        studentIds.push(_id);
        emit StudentRegistered(_id, _name);
    }

    // Admin can removes a student
    function removeStudent(uint256 _id) external onlyAdmin {
        require(students[_id].isRegistered, "Student not found");
        delete students[_id];
        
        for (uint256 i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _id) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }
        
        emit StudentRemoved(_id);
    }

    // Student pays school fees
    function paySchoolFees(uint256 _studentId) external payable {
        require(students[_studentId].isRegistered, "Student not found");
        require(msg.value > 0, "Fee amount must be greater than zero");

        students[_studentId].feesPaid += msg.value;
        emit FeesPaid(_studentId, msg.value);
    }

    // Get student details
    function getStudentById(uint256 _id) external view returns (string memory, uint256) {
        require(students[_id].isRegistered, "Student not found");
        return (students[_id].name, students[_id].feesPaid);
    }

    // This get all registered students
    function getAllStudents() external view returns (Student[] memory) {
        Student[] memory registeredStudents = new Student[](studentIds.length);
        for (uint256 i = 0; i < studentIds.length; i++) {
            registeredStudents[i] = students[studentIds[i]];
        }
        return registeredStudents;
    }

    // This check if an address is a registered staff member
    function isStaff(address _staffAddress) external view returns (bool) {
        return staffMembers[_staffAddress].isRegistered;
    }
}
