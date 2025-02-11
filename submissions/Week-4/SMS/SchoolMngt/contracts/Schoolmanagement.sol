// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SchoolManagementSystem {
    address public principal;
    uint256 public schoolFees = 0.05 ether;
    uint256 private studentIdCounter;
    uint256 private staffIdCounter;
    
    struct Student {
        uint256 id;
        string name;
        uint256 grade;
        bool isRegistered;
        bool hasPaidFees;
    }
    
    struct Staff {
        uint256 id;
        string name;
        string subject;
        bool isRegistered;
    }
    
    mapping(address => Student) public students;
    mapping(address => Staff) public staff;
    mapping(address => bool) public isStaff;
    mapping(uint256 => address) public studentIdToAddress;
    mapping(uint256 => address) public staffIdToAddress;
    
    event StudentRegistered(address indexed studentAddress, uint256 id, string name);
    event StaffRegistered(address indexed staffAddress, uint256 id, string name);
    event FeePaid(address indexed student, uint256 amount);
    event SchoolFeesUpdated(uint256 oldFees, uint256 newFees);
    
    modifier onlyPrincipal() {
        require(msg.sender == principal, "Only principal can call this function");
        _;
    }
    
    modifier onlyStaffOrPrincipal() {
        require(msg.sender == principal || isStaff[msg.sender], "Only staff or principal can call this function");
        _;
    }
    
    constructor() {
        principal = msg.sender;
        studentIdCounter = 1;
        staffIdCounter = 1;
    }

    function setSchoolFees(uint256 _newFees) public onlyPrincipal {
        uint256 oldFees = schoolFees;
        schoolFees = _newFees;
        emit SchoolFeesUpdated(oldFees, _newFees);
    }
    
    function registerStaff(address _staffAddress, string memory _name, string memory _subject) public onlyPrincipal {
        require(!isStaff[_staffAddress], "Staff already registered");
        require(_staffAddress != address(0), "Invalid address");
        
        uint256 newStaffId = staffIdCounter++;
        
        staff[_staffAddress] = Staff({
            id: newStaffId,
            name: _name,
            subject: _subject,
            isRegistered: true
        });
        
        staffIdToAddress[newStaffId] = _staffAddress;
        isStaff[_staffAddress] = true;
        emit StaffRegistered(_staffAddress, newStaffId, _name);
    }
    
    function registerStudent(
        address _studentAddress, 
        string memory _name, 
        uint256 _grade
    ) public onlyStaffOrPrincipal {
        require(!students[_studentAddress].isRegistered, "Student already registered");
        require(_studentAddress != address(0), "Invalid address");
        
        uint256 newStudentId = studentIdCounter++;
        
        students[_studentAddress] = Student({
            id: newStudentId,
            name: _name,
            grade: _grade,
            isRegistered: true,
            hasPaidFees: false
        });
        
        studentIdToAddress[newStudentId] = _studentAddress;
        emit StudentRegistered(_studentAddress, newStudentId, _name);
    }
    
    function getStudentById(uint256 _id) public view returns (
        address studentAddress,
        string memory name,
        uint256 grade,
        bool hasPaidFees
    ) {
        address addr = studentIdToAddress[_id];
        require(addr != address(0), "Student not found");
        Student memory student = students[addr];
        return (addr, student.name, student.grade, student.hasPaidFees);
    }
    
    function getStaffById(uint256 _id) public view returns (
        address staffAddress,
        string memory name,
        string memory subject
    ) {
        address addr = staffIdToAddress[_id];
        require(addr != address(0), "Staff not found");
        Staff memory staffMember = staff[addr];
        return (addr, staffMember.name, staffMember.subject);
    }
    
    function paySchoolFees() public payable {
        require(students[msg.sender].isRegistered, "Student not registered");
        require(!students[msg.sender].hasPaidFees, "Fees already paid");
        require(msg.value == schoolFees, "Incorrect fee amount");
        
        students[msg.sender].hasPaidFees = true;
        emit FeePaid(msg.sender, msg.value);
    }
    
    function getStudentDetails(address _studentAddress) public view returns (
        uint256 id,
        string memory name,
        uint256 grade,
        bool isRegistered,
        bool hasPaidFees
    ) {
        Student memory student = students[_studentAddress];
        return (
            student.id,
            student.name,
            student.grade,
            student.isRegistered,
            student.hasPaidFees
        );
    }
    
    function getStaffDetails(address _staffAddress) public view returns (
        uint256 id,
        string memory name,
        string memory subject,
        bool isRegistered
    ) {
        Staff memory staffMember = staff[_staffAddress];
        return (
            staffMember.id,
            staffMember.name,
            staffMember.subject,
            staffMember.isRegistered
        );
    }
    
    function withdrawFunds() public onlyPrincipal {
        payable(principal).transfer(address(this).balance);
    }
}