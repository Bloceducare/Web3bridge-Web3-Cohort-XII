// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// my logic
// step 1; firstly we need to have an account for the principal which is the owner 
// step 2 then the owner can create or register staff
// step 3 the step 2 and 1 can create or add student which they have details
// step 4 then the student can pay there school fees to the smart contract address

// additional features
// owner can update school fees incase of tinubu regime 😂
// total number of student and staff


contract SchoolManagement {

    uint256 public schoolFeesAmount;
    enum Gender { Male, Female }
    enum Role { Teacher, Admin, Accountant }
    //for staff
    struct Staff {
        uint256 id;
        Role role;
        address staffAddress;
        string name;
        Gender gender;
        uint8 age;
        bool isActive;
    }
    mapping(uint256 => Staff) public staffList;
    mapping(address => bool) public isStaff; 
    uint256 public staffCounter;
     uint256[] private staffIds; 

    //for student

    struct Student {
        uint id;
        address studentAddress;
        string name;
        string class;
        Gender gender;
        uint8 age;
        uint256 schoolFeesAmount; 
          bool hasPaid;
        bool isActive;
    }
    mapping(address => Student) public studentList;
    uint256 public studentCounter;
    address[] private studentAddresses;

    //owner adress

    address payable public principal;

    constructor() {
        principal = payable(msg.sender);
        schoolFeesAmount = 1 ether; 
        staffCounter = 1;
    studentCounter = 1; 
    }

    modifier onlyOwner() {
        require(msg.sender == principal, "principal only");

        _;
    }

    modifier onlyStaff(uint256 _staffId) {
        require(staffList[_staffId].staffAddress == msg.sender, "staff only");

        _;
    }
    modifier onlyPrincipalOrStaff() {
        require(msg.sender == principal || isStaff[msg.sender], "Only principal or staff can perform this action");
        _;
    }

    event StaffRegistered(uint256 indexed id, Role role, address indexed staffAddress);
event StudentRegistered(uint256 indexed id, string class, address indexed studentAddress);
event SchoolFeesPaid(address indexed studentAddress, uint256 amount);
event SchoolFeesUpdated(uint256 newAmount);


    function updateSchoolFees(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "new fee must be greater than zero ");
        schoolFeesAmount = _newAmount;

        emit SchoolFeesUpdated(_newAmount);
    }


    function registerStaff(
        Role _role,
        string memory _name,
        Gender _gender,
        address _staffAddress,
        uint8 _age
    ) external onlyOwner {
        require(staffCounter != 0, "ID cannot be zero");
        require(staffList[staffCounter].id  == 0, "staff already exit" );
        
        staffList[staffCounter] = Staff({
            id: staffCounter,
            role: _role,
            staffAddress:  _staffAddress,
            name: _name,
            gender: _gender,
            age: _age,
        
            isActive: true
        });

                isStaff[_staffAddress] = true; // Mark the staff as registered
                staffIds.push(staffCounter);
                emit StaffRegistered(staffCounter, _role, _staffAddress);
                staffCounter++;
    }
    
    //function
        function registerStudent(
        string memory _class,
        string memory _name,
        Gender _gender,
        address _studentAddress,
        uint8 _age
    ) external onlyPrincipalOrStaff{
        require(studentCounter != 0, "ID cannot be zero");
        require(_studentAddress != address(0), "Invalid address");
        require(studentList[_studentAddress].id  == 0, "student already exit" );
    
        studentList[_studentAddress] = Student({
            id: studentCounter,
            class: _class,
            studentAddress:  _studentAddress,
            name: _name,
            gender: _gender,
            age: _age,
            isActive: true,
            schoolFeesAmount : schoolFeesAmount, 
            hasPaid: false
        });
          studentAddresses.push(_studentAddress);
           emit StudentRegistered(studentCounter, _class, _studentAddress);
          studentCounter++; 
    }

    //  function studentPayment(uint256 _id) external payable {
    //    require(msg.value > 0, "Pledge amount must be greater than 0");
    //    Student storage student = studentList[_id];

    //    student.schoolFeesAmount = 200000;

    //    payable( address( this).balance).transfer(student.schoolFeesAmount);
    //  }
// function studentPayment(uint256 _id) external payable {
//     Student storage student = studentList[_id];

//     require(student.id != 0, "Student does not exist");
//     require(student.isActive, "Student is not active");
//     require(msg.value == schoolFeesAmount, "Incorrect fee amount");

//     // Funds are stored in the contract balance
// }

// Student pays their school fees using their address
    function studentPayment() external payable {
        Student storage student = studentList[msg.sender];

        require(student.studentAddress != address(0), "Student not found");
        require(student.isActive, "Student is not active");
        require(!student.hasPaid, "Student has already paid");
        require(msg.value ==  schoolFeesAmount, "Incorrect fee amount");

        student.hasPaid = true; 
        emit SchoolFeesPaid(msg.sender, msg.value);
    }


    function getAllStaff() external view returns (Staff[] memory) {
        Staff[] memory allStaff = new Staff[](staffIds.length);
        for (uint256 i = 0; i < staffIds.length; i++) {
            allStaff[i] = staffList[staffIds[i]];
        }
        return allStaff;
    }

    // registered students
    function getAllStudents() external view returns (Student[] memory) {
        Student[] memory allStudents = new Student[](studentAddresses.length);
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            allStudents[i] = studentList[studentAddresses[i]];
        }
        return allStudents;
    }

    // verification true or force
    function hasStudentPaid(address _studentAddress) external view returns (bool) {
        return studentList[_studentAddress].hasPaid;
    }
}

