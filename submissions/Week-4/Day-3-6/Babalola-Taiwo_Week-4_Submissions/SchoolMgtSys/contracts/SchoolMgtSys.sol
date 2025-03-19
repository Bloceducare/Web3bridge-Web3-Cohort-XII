// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SchoolMgtSys {

    string public schoolName;
    uint private schoolFee;
    address public immutable proprietor;

    uint256 public staffCount;
    uint256 public studentCount;

    enum feePayment {
        fullPayment,
        partPayment
    }

    constructor(){
        proprietor = msg.sender;
    }

    modifier proprietorAccess(){
        require(msg.sender == proprietor, "Only Proprietor Access");
        _;
    }

    function setSchoolName(string memory _schoolName)public proprietorAccess {
        schoolName = _schoolName;
    }

     function setSchoolFee(uint _schoolFee) private proprietorAccess {
        schoolFee = _schoolFee;
    }



    struct staff {
        uint32 _id;
        string _name;
        string _gender;
        uint16 _age;
        string _subject;
        bool _isVerified;
        address _staffAddress;
    }

    mapping(uint32 => staff) public staffList;
    mapping(address => bool) public staffStatus;

    function registerStaff(uint32 _id, string memory _name, string memory _gender, uint16 _age, string memory _subject, address _staffAddress) public proprietorAccess{
        require(_id != 0, "id cannot be zero");
        require(!staffStatus[_staffAddress], "this staff is already registered");
        staffCount++;

        staffList[_id] = staff({
            _id: _id,
            _name: _name,
            _gender: _gender,
            _age: _age,
            _subject: _subject,
            _isVerified: true,
            _staffAddress: _staffAddress
        });

        staffStatus[_staffAddress] = true;
    }



    struct student {
        uint32 id;
        string name;
        string gender;
        uint16 age;
        string class;
        bool isSeniorGrade;
        address studentAddress;
        feePayment fee;
    }

    mapping(uint32 => student) public studentList;
    mapping(address => bool) public studentStatus;

    modifier StaffnProprietorAccess() {
        require(msg.sender == proprietor || staffStatus[msg.sender], "Only Proprietor or Registered Staff can access");
        _;
    }

function registerStudent(uint32 id, string memory name, string memory gender, uint16 age, string memory class, address studentAddress) public proprietorAccess {
    require(id != 0, "id cannot be zero");
    require(!studentStatus[studentAddress], "This student is already registered");
    studentCount++;

    studentList[id] = student({
        id: id,
        name: name,
        gender: gender,
        age: age,
        class: class,
        isSeniorGrade: false,
        studentAddress: studentAddress,
        fee: feePayment.fullPayment // Initialized fee default to full
    });

    studentStatus[studentAddress] = true;
}



    mapping(uint32 => uint256) public feeBalance;

    function payFees(uint32 _id) external payable {
        require(studentList[_id].studentAddress != address(0), "STUDENT NOT REGISTERED");
        require(studentList[_id].fee != feePayment.fullPayment, "FEE FULLY PAID");
        require(msg.value > 0, "PAYMENT MUST BE GREATER THAN ZERO");
        require(msg.value <= schoolFee, "PAYMENT EXCEEDS SCHOOL FEE");

        feeBalance[_id] += msg.value;

        if (feeBalance[_id] >= schoolFee) {
            studentList[_id].fee = feePayment.fullPayment;
        } else {
            studentList[_id].fee = feePayment.partPayment;
        }
    }

}
