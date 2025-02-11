// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SMS {

    event StudentRegistered(uint256 id, address indexed _stuendent);
    event StaffRegistered(uint256 staffsId, address indexed staffAdded);
    event salaryPaid(uint256 id, uint256 indexed amount);
    event studentUpdated(uint256 id);
    event schoolFeesPaid(uint256 indexed id, uint256 indexed amount);

    struct Student{
        string name;
        uint256 age;
        bool paidFees;
        uint256 fees;
        string gender;
    }

    struct Staff{
        string staffname;
        string gender;
        uint256 age;
        bool salaryPaid;
        uint256 salaryAmount;
        address staffAddress;
        bool resigned;
        bool retired;
    }

    uint256 contractBalance;
    address public principal;
    uint256 public studentId;
    uint256 public staffNo;
    uint256 constant SCHOOL_FEES = 0.005 ether;
    uint256 constant SALARY_AMOUNT = 0.0005 ether;

    mapping(uint256 => Student) public students;
    mapping(uint256 => Staff) public staff;
    
    

    constructor() {
        principal = msg.sender;
    }

    modifier Onlyprincipal()  {
        require(msg.sender == principal, "You are not the teacher");
        _;
    }

    function registerStudent(string memory _name, uint256 _age, uint256 _fees, string memory _gender) external {
        require(msg.sender != address(0), "Address zero not allowed");
        uint256 _id = studentId + 1;
        Student memory studentManagement =  Student({
            name: _name,
            age: _age,
            paidFees: false,
            fees: _fees,
            gender: _gender
        });
        students[_id] = studentManagement;
        studentId += 1;
        emit StudentRegistered(_id, msg.sender);
    }

    function registerStaff(string memory _staffName, string memory _gender, uint256 _age, uint256 _salaryAmt, address _staffAddress) Onlyprincipal external {
        require(msg.sender != address(0), "Address zero not allowed");
        uint256 _staffId = staffNo + 1;
        Staff memory staffDetails = Staff({
            staffname: _staffName,
            gender: _gender,
            age: _age,
            salaryPaid: false,
            salaryAmount: _salaryAmt,
            staffAddress: _staffAddress,
            resigned: false,
            retired: false
        });
        staff[_staffId] = staffDetails;
        staffNo += 1;
        emit StaffRegistered(_staffId, msg.sender);
    }


    function getStudent(uint id) public view returns(string memory, uint, bool, uint, string memory){
        Student memory particularStudent = students[id];
        return (particularStudent.name, particularStudent.age, particularStudent.paidFees, particularStudent.fees, particularStudent.gender);
    }

    function updateStudent(uint id, string memory updateName, uint256 updateAge, string memory updateGender) public Onlyprincipal {
        Student storage studentToBeUpdated = students[id];
        studentToBeUpdated.name = updateName;
        studentToBeUpdated.age = updateAge;
        studentToBeUpdated.gender = updateGender;

        emit studentUpdated(id);

    }

function paySchoolFees(uint id) external payable {
    require(msg.sender != address(0), "Invalid sender");
    require(msg.value == SCHOOL_FEES, "Incorrect fee amount");
    require(SCHOOL_FEES == students[id].fees, "Fee mismatch");
    require(students[id].paidFees == false, "Fees already paid");

    
    (bool success, ) = payable(principal).call{value: msg.value}("");
    require(success, "Fee transfer failed"); 

    students[id].paidFees = true;

    emit schoolFeesPaid(id, SCHOOL_FEES);
}


    function removeStudent(uint256 id) external Onlyprincipal {
        require(students[id].paidFees == false);
        delete students[id];  
    }

    function getStaff(uint id) public view returns(string memory, string memory, uint, bool, uint ){
        Staff memory particularStaff = staff[id];
        return (particularStaff.staffname, particularStaff.gender, particularStaff.age, particularStaff.salaryPaid, particularStaff.salaryAmount);
    }

    function updateStaff(uint id, string memory updateName, uint256 updateAge, string memory updateGender) public  {
        Staff storage staffToBeUpdated = staff[id];
        staffToBeUpdated.staffname = updateName;
        staffToBeUpdated.age = updateAge;
        staffToBeUpdated.gender = updateGender;
    }

    function removeStaff(uint256 id) external Onlyprincipal {
        require(staff[id].resigned == true);
        require(staff[id].retired == true);
        delete staff[id];
    }

    function paySalaryToStaff(uint id, address staffAddr) external payable Onlyprincipal {
        require(SALARY_AMOUNT == staff[id].salaryAmount);
        require(staff[id].salaryPaid == false);
        require(staff[id].staffAddress == staffAddr);
        require(address(this).balance >= SALARY_AMOUNT);
        require(msg.value == SALARY_AMOUNT, "Incorrect fee amount");

        // contractBalance = address(this).balance;
        // contractBalance -= SALARY_AMOUNT;
        // payable(staffAddr).transfer(SALARY_AMOUNT);
        (bool success, ) = payable(staffAddr).call{value: msg.value}("");
        require(success, "Salary transfer failed");

        staff[id].salaryPaid = true;

        emit salaryPaid(id, SALARY_AMOUNT);

    }

}

