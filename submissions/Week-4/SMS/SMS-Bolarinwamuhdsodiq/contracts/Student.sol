// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract StudentPortal {
    uint256 public studentLength;
    uint256 public staffLength;

    enum StudentStatus {
        ACTIVE,
        GARADUTED,
        SUSPENSION
    }

    uint256 public isAdministratorLength;

    address payable public founder;

    uint256 public portalbalance;

    struct Student {
        string fullName;
        string class;
        string DateOfBirth;
        address studentAddress;
        string contactInfo;
        StudentStatus status;
        uint256 enrollmentDate;
        string grade;
        uint256 payment;
    }

    struct Staff {
        string fullname;
        string contact;
        address payable staffAddress;
    }

    //we can use this to get sudent detail
    mapping(uint256 => Student) public _students;
    mapping(uint256 => Staff) public _staff;
    mapping(address => bool) public isAdminstrator;

    event StudentRegistered(
        uint256 indexed studentId,
        string fullName,
        address studentAddress,
        string contactInfo,
        StudentStatus status,
        uint256 enrollmentDate,
        string grade,
        uint256 payment
    );
    event AdminRegistered(address administrator, bool isAdmin);
    event SchoolFeePaid(uint256 indexed studentId, uint256 amount);
    event StaffAdded(
        uint256 indexed staffId,
        string fullName,
        address staffAddress
    );

    modifier isFounder() {
        require(msg.sender == founder);
        _;
    }
    modifier isAdminstratorModifier() {
        require(
            isAdminstrator[msg.sender],
            "Must be a adminstrator, ask the founder"
        );
        _;
    }

    constructor(address payable _founder) {
        founder = _founder;
    }

    function enrollStudent(
        string memory _fullName,
        string memory _class,
        string memory _dateOfBirth,
        address _studentAddress,
        string memory _contactInfo,
        uint256 _enrollmentDate,
        string memory _grade,
        uint256 _payment
    ) public isAdminstratorModifier {
        require(_studentAddress != address(0), "Invalid student address");
        Student memory newStudent = Student({
            fullName: _fullName,
            class: _class,
            DateOfBirth: _dateOfBirth,
            studentAddress: _studentAddress,
            contactInfo: _contactInfo,
            status: StudentStatus.ACTIVE,
            enrollmentDate: _enrollmentDate,
            grade: _grade,
            payment: _payment
        });

        _students[studentLength] = newStudent;

        emit StudentRegistered(
            studentLength,
            _fullName,
            _studentAddress,
            _contactInfo,
            StudentStatus.ACTIVE,
            _enrollmentDate,
            _grade,
            _payment
        );
        studentLength++;
    }

    function addStaff(
        string memory _fullName,
        string memory _contact,
        address payable _staffAddress
    ) public isAdminstratorModifier {
        require(_staffAddress != address(0), "Invalid staff address");
        Staff memory newStaff = Staff({
            fullname: _fullName,
            contact: _contact,
            staffAddress: _staffAddress
        });

        _staff[staffLength] = newStaff;
        emit StaffAdded(staffLength, _fullName, _staffAddress);

        staffLength++;
    }

    function setAdmin(address _adminAddress) public isFounder {
        require(_adminAddress != address(0), "Invalid admin address");
        isAdminstrator[_adminAddress] = true;
        emit AdminRegistered(_adminAddress, true);
    }

    function schoolfeePyament(
        uint256 _amount,
        uint256 _studentId
    ) public payable {
        require(_studentId < studentLength, "student doesn't exist");
        require(_amount > 0, "amount is less than zero");
        _students[_studentId].payment += _amount;

        // _students[_studentId].payment;
        founder.transfer(_amount);
        portalbalance += _amount;
        emit SchoolFeePaid(_studentId, _amount);
    }

    function getBalance() public view returns (uint256) {
        return portalbalance;
    }

    function isAdministrator(address _adminAddress) public view returns (bool) {
        require(_adminAddress != address(0), "Invalid address");
        return isAdminstrator[_adminAddress];
    }
}