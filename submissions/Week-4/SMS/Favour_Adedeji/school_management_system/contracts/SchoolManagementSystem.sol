// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SchoolManagementSystem {
  address private principal;
  string public schoolName;
  uint256 public courseCount;
  // uint256 public constant SCHOOLFEE = 0.01 ether;
  uint256 public schoolFee;
  mapping(address => StaffInfo) public staffs;
  mapping(address => StudentInfo) public students;
  mapping(uint256 => Course) public courses;

  event NewStaffAdded(address indexed addr, string indexed name);
  event StudentCreated(address indexed addr, string indexed name);
  event payment(address indexed sender, uint256 amount);
  event CourseCreated(string indexed name, address indexed creator);
  event StaffRemoved(address indexed removedAddr);
  event StudentRemoved(address indexed removedAddr);

  constructor(string memory _schoolName) {
    schoolName = _schoolName;
    principal = msg.sender;
  }

  struct StaffInfo {
    string name;
    string areaOfSpecialization;
    bool isRegistered;
  }

  struct StudentInfo {
    string name;
    uint8 age;
    string gender;
    string courseOfStudy;
    bool hasPaid;
    uint256 amountPaid;
    bool isStudent;
    address registeredBy;
    address addr;
    uint8 registeredCoursesCount;
    mapping(string => uint256) registeredCourses;
  }

  struct Course {
    string name;
    address creator;
  }

  modifier onlyPrincipal() {
    require(msg.sender == principal, "ONLY PRINCIPAL HAS AUTHORIZE ACCESS");
    _;
  }

  modifier eitherPrincipalOrStaff() {
    require(msg.sender == principal || staffs[msg.sender].isRegistered, "EITHER PRINCIPAL OR STAFF HAS AUTHORIZE ACCESS");
    _;
  }

  modifier onlyStudent(string memory message) {
    require(students[msg.sender].isStudent, message);
    _;
  }

  function registerStaff(
    string memory _name,
    string memory _aos,
    address _addr
  ) public onlyPrincipal() {

    StaffInfo memory staffDetail = StaffInfo({
      name: _name,
      areaOfSpecialization: _aos,
      isRegistered: true
    });

    staffs[_addr] = staffDetail;
    emit NewStaffAdded(_addr, staffDetail.name);
  }

  function registerStudent(
    string memory _name,
    uint8 _age,
    string memory _gender,
    string memory _cos,
    address _addr
  ) public eitherPrincipalOrStaff() {
    require(_addr != address(0), "INVALID ADDRESS PROVIDED");
    require(_age > 15, "NOT OLD ENOUGH TO REGISTER AS A STUDENT");

    students[_addr].name = _name;
    students[_addr].age = _age;
    students[_addr].gender = _gender;
    students[_addr].courseOfStudy = _cos;
    students[_addr].addr = _addr;
    students[_addr].registeredBy = msg.sender;
    students[_addr].isStudent = true;

    emit StudentCreated(_addr, students[_addr].name);
  }

  function removeStaff(address _addr) external onlyPrincipal() {
    require(staffs[_addr].isRegistered, "NOT A REGISTERED STAFF");

    staffs[_addr].name = "";
    staffs[_addr].areaOfSpecialization = "";
    staffs[_addr].isRegistered = false;
    
    emit StaffRemoved(_addr);
  }

  function removeStudent(address _addr) external onlyPrincipal() {
    require(students[_addr].isStudent, "NOT A REGISTERED STUDENT");
    delete students[_addr];
    
    emit StudentRemoved(_addr);
  }

  function setSchoolFee(uint256 newSchFeeAmount) external onlyPrincipal() {
    schoolFee = newSchFeeAmount;
  }

  function paySchoolFee() external payable onlyStudent("ONLY STUDENT CAN PAY SCHOOL FEE") {
    require(!students[msg.sender].hasPaid, "SCHOOL FEE ALREADY PAID");
    require(msg.value == schoolFee, "AMOUNT MUST BE EXACTLY THE SCHOOL FEE IN ETH");
    students[msg.sender].amountPaid += msg.value;
    students[msg.sender].hasPaid = true;

    emit payment(msg.sender, msg.value);
  }

  // create course => either principal or staff
  function createCourse(string memory courseName) external eitherPrincipalOrStaff() {

    courseCount += 1;
    courses[courseCount] = Course({ name: courseName, creator: msg.sender });

    emit CourseCreated(courseName, msg.sender);
  }
  
  // register for a course
  function registerCourse(string memory courseName) external onlyStudent("ONLY STUDENT CAN REGISTER"){
    require(students[msg.sender].hasPaid, "YOU HAVEN'T PAY FOR SCHOOL FEE");

    students[msg.sender].registeredCourses[courseName] = 0;
    students[msg.sender].registeredCoursesCount += 1;

  }

  // upload scores => either principal or staff
  function uploadScores(string memory courseName, address _address, uint256 score) external eitherPrincipalOrStaff() {
    require(score <= 100, "INVALID SCORE");
    students[_address].registeredCourses[courseName] = score;
  }

  // check scores => student should be able to check his/her scores
  function checkScores(string memory courseName) external view returns(uint256) {
    return students[msg.sender].registeredCourses[courseName];
  }

  function getPrincipal() external view returns(address) {
    return principal;
  }

}