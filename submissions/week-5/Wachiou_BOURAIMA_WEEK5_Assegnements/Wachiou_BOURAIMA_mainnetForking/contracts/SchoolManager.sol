// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract SchoolManager {
    address payable public admin;
    uint256 public constant SCHOOL_FEES = 0.5 * 10e18; // 0.5 ether
    mapping(address => Student) public students;
    mapping(address => Staff) public staffs;
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Payement) public payements;
    mapping (uint256 => StudentMarks) studentMarks;


    enum Gender { Male, Female }
    struct Student {
        string studentName;
        Gender _gender;
        uint8 age;
        uint256 studentId;
        bool hasPaidSchoolFee;
        uint256 registrationDate;
       
    }

    struct Course {
        string courseName;
        uint256 staffId;
        uint256 courseId;
        uint16 courseDuration;
        uint256 courseStartDate;
        uint256 courseEndDate;
    }

    struct StudentMarks {
        uint256 studentId;
        uint256 courseId;
        uint256 staffId;
        uint8 marks;
    }

    struct Staff {
        string staffName;
        Gender _gender;
        string staffRole;
        uint256 staffId;
        uint256 salary;
        uint256 joiningDate;
    }

    struct Payement {
        uint256 payementId;
        uint256 accountId;
        uint256 amount;
        string reason;
        uint256 payementDate;
    }

    uint256 public studentCount;
    uint256 public staffCount;
    uint256 public courseCount;
    uint256 public payementCount;

    constructor() {
        admin = payable(msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can register staffs or pay salary or remove staffs, students or courses");
        _;
    }
    modifier onlyStaff() {
        require(staffs[msg.sender].staffId != 0, "Only staff can add marks");
        _;
    }
    modifier onlyAdminOrStaff() {
        require(staffs[msg.sender].staffId != 0 || msg.sender == admin, "Only admin or staff can register  students");
        _;
    }
    modifier onlyStudent() {
        require(students[msg.sender].studentId != 0, "Only student can enroll in course");
        _;
    }

    event Registred(string _name,uint256 itemId, uint256 _RegistrationDate);
    event Removed(string _name, uint256 itemId, uint256 removedAt);
    event Payed(string studentName, uint256 itemId, uint256 payementDate);
    event Marked(address studentAddress, uint256 courseId,  uint256 markedAt);

    function registerStudent( address studentAddr, string memory studentName,
        Gender _gender,
        uint8 age)
        public
        onlyAdminOrStaff {
            require(studentAddr != address(0), "Invalid address");
            require(bytes(studentName).length > 0, "Invalid name");
            require(age > 0, "Invalid age");
            require(students[studentAddr].studentId != 0, "Student already exists");
            uint256 stdId = studentCount + 1;

            students[studentAddr] = Student({
                studentName: studentName,
                _gender: _gender,
                age: age,
                studentId: stdId,
                hasPaidSchoolFee: false,
                registrationDate: block.timestamp
            });
            studentCount++;
            emit Registred(studentName, stdId, block.timestamp);


        }
    
    function getStudent(address studentAddr) public view returns (Student memory) {
        return students[studentAddr];
    }

    function RemoveStudent(address studentAddr) 
    public 
    onlyAdmin
    {
        require(studentAddr != address(0), "Invalid address");
        require(students[studentAddr].studentId != 0, "Student does not exist");
        string memory studentName = students[studentAddr].studentName;
        uint256 studentId = students[studentAddr].studentId;
        delete students[studentAddr];
        studentCount--;
        emit Removed(studentName, studentId, block.timestamp);
    }

    function registerStaff(address staffAddr ,string memory courseName, uint256 slary,  Gender _gender,
        string memory staffRole) 
        public
        onlyAdmin {
            require(staffAddr != address(0), "Invalid address");
            require(bytes(courseName).length > 0, "Invalid course name");
            require(staffs[staffAddr].staffId != 0, "Staff already exists");
            // require(courses[courseId].courseId == courseId, "Course does not exist, please add course first");

            uint256 staffId = staffCount + 1;
            staffs[staffAddr] = Staff({
                staffName: courseName,
                staffRole: staffRole,
                _gender: _gender,
                staffId: staffId,
                salary: slary,
                joiningDate: block.timestamp
            });
            staffCount++;
            emit Registred(courseName, staffId, block.timestamp);

        }

    function getStaff(address staffAddr) public view returns (Staff memory) {
        return staffs[staffAddr];
    }

    function RemoveStaff(address staffAddr) 
    public 
    onlyAdmin
    {
        require(staffAddr != address(0), "Invalid address");
        require(staffs[staffAddr].staffId != 0, "Staff does not exist");
        string memory staffName = staffs[staffAddr].staffName;
        uint256 staffId = staffs[staffAddr].staffId;
        delete staffs[staffAddr];
        staffCount--;
        emit Removed(staffName, staffId, block.timestamp);
    }
    function addCourse(string memory courseName, uint256 staffId, uint16 courseDuration, uint256 courseStartDate, uint256 courseEndDate) public onlyAdmin {
        require(bytes(courseName).length > 0, "Invalid course name");
        require(courseDuration > 0, "Invalid course duration");
        require(courseStartDate > block.timestamp , "Invalid course start date");
        require(courseEndDate > courseStartDate, "Invalid course end date");
        uint256 courseId = courseCount + 1;
        courses[courseId] = Course({
            courseName: courseName,
            staffId: staffId,
            courseId: courseId,
            courseDuration: courseDuration,
            courseStartDate: courseStartDate,
            courseEndDate: courseEndDate
        });
        courseCount++;
    }

    function getCourse(uint256 courseId) public view returns (Course memory) {
        return courses[courseId];
    }

    function removeCourse(uint256 courseId) public onlyAdmin {
        require(courses[courseId].courseId == courseId, "Course does not exist");
        string memory courseName = courses[courseId].courseName;
        uint256 staffId = courses[courseId].staffId;
        delete courses[courseId];
        courseCount--;
        emit Removed(courseName, staffId, block.timestamp);
    }


    function paySchoolFee(uint8 amount ) external payable onlyStudent {
        require((amount * 10e18) == SCHOOL_FEES, "Invalid amount");
        require(msg.sender != address(0), "Invalid address");
        require(students[msg.sender].hasPaidSchoolFee == false, "School fee already paid");
        admin.transfer(SCHOOL_FEES);
        uint256 studentId = students[msg.sender].studentId;
        uint256 payementId = payementCount + 1;
        payements[studentId] = Payement({
            payementId: payementId,
            accountId: studentId,
            amount: SCHOOL_FEES,
            reason: "School fee",
            payementDate: block.timestamp
        });
        payementCount++;
        students[msg.sender].hasPaidSchoolFee = true;
        emit Payed(students[msg.sender].studentName, students[msg.sender].studentId, block.timestamp);
    }

    function payStaffSalary(address staffAddr) external payable onlyAdmin {
        require(staffs[staffAddr].staffId != 0, "Staff does not exist");
        require(admin != address(0), "Invalid address");
        require(staffAddr != address(0), "Invalid address");
        uint256 amount = staffs[staffAddr].salary * 10e18;
        uint256 staffId= staffs[staffAddr].staffId;
        payable(staffAddr).transfer(amount);
        uint256 payementId = payementCount + 1;
        payements[staffId] = Payement({
            payementId: payementId,
            accountId: staffId,
            amount: staffs[staffAddr].salary,
            reason: "Salary",
            payementDate: block.timestamp
        });
        payementCount++;
        emit Payed(staffs[staffAddr].staffName, staffs[staffAddr].staffId, block.timestamp);
    }
    function getStudentCount() public view returns (uint256) {
        return studentCount;
    }

    function markStudent(address studentAddr, uint256 courseId, uint8 marks ) public onlyStaff {
        require(students[studentAddr].studentId != 0, "Student does not exist");
        require(students[studentAddr].hasPaidSchoolFee, "Student has not paid school fee");
        require(courses[courseId].courseId == courseId, "Course does not exist");
        uint256 studentId = students[studentAddr].studentId;
        uint256 staffId = staffs[msg.sender].staffId;

        studentMarks[staffId] = StudentMarks({
            studentId: studentId,
            courseId: courseId,
            staffId: staffId,
            marks: marks
        });
    
        emit Marked(studentAddr, courseId, block.timestamp);
    }

    function getStudentMarks() public view onlyAdminOrStaff returns  (StudentMarks memory) {
        return studentMarks[staffs[msg.sender].staffId];
    }
}