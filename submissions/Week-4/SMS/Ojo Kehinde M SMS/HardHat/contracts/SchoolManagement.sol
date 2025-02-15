// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SchoolManagement {

    struct Staff {
        string _name;
        string _gender;
        uint32 _staffId;
        string _role;
        bool _active;
        address _staffAddress;
    }

    enum feeStatus {
        noPayment,
        halfPayment,
        fullPayment
    }

    struct Student {
        string _name;
        uint32 _id;
        string _class;
        uint32 _age;
        bool _isRegistered;
        address _studentAddress;
        feeStatus _fee;
    }

    address public owner;
    mapping(uint => Staff) public staffList;
    mapping(address => bool) public staffCheck;
    uint public staffCounter;
    mapping(uint => Student) public studentList;
    uint public studentCounter;

    uint256 public constant halfPayment = 0.001 ether;
    uint256 public constant fullPayment = 0.002 ether;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyPrincipal() {
        require(msg.sender == owner, "ONLY THE PRINCIPAL CAN CALL THIS");
        _;
    }

    modifier staff(uint256 _staffId) {
        require(msg.sender == owner || staffCheck[msg.sender], "ONLY PRINCIPAL & STAFF CAN REGISTER STUDENT");
        _;
    }

    /// STAFF MANAGEMENT
    function createStaff(
        string memory _name, string memory _gender, uint32 _staffId, 
        string memory _role, address _staffAddress
    ) external onlyPrincipal {
        require(_staffId != 0, "ID cannot start from zero");
        require(!staffCheck[_staffAddress], "STAFF ALREADY REGISTERED");
        staffCounter++;

        staffList[_staffId] = Staff({
            _name: _name,
            _gender: _gender,
            _staffId: _staffId,
            _role: _role,
            _active: true,
            _staffAddress: _staffAddress
        });

        staffCheck[_staffAddress] = true;
    }

    // Get all staff members
    function getAllStaff() public view returns (Staff[] memory) {
        Staff[] memory staffArray = new Staff[](staffCounter);
        uint index = 0;

        for (uint i = 1; i <= staffCounter; i++) {
            staffArray[index] = staffList[i]; 
            index++;
        }
        return staffArray;
    }

    // STUDENT MANAGEMENT
    function registerStudent(
        string memory _name, uint32 _id, string memory _class, uint32 _age, 
        address _studentAddress, feeStatus _fee
    ) external staff(0) {  
        require(_id != 0, "ID cannot start from zero");
        require(!studentList[_id]._isRegistered, "STUDENT ALREADY REGISTERED");
        studentCounter++;

        studentList[_id] = Student({
            _name: _name,
            _id: _id,
            _class: _class,
            _age: _age,
            _isRegistered: true,
            _studentAddress: _studentAddress,
            _fee: _fee
        });
    }

        // FEE PAYMENT
    function payFees(uint _id) external payable {
        require(studentList[_id]._isRegistered, "NOT A REGISTERED STUDENT");
        require(studentList[_id]._fee != feeStatus.fullPayment, "FEES IS FULLY PAID");
        require(msg.value == halfPayment || msg.value == fullPayment, "PAY HALF OR FULL PAYMENT");

        if (studentList[_id]._fee == feeStatus.noPayment && msg.value == halfPayment) {
            studentList[_id]._fee = feeStatus.halfPayment;
        } else if (studentList[_id]._fee == feeStatus.halfPayment && msg.value == halfPayment) {
            studentList[_id]._fee = feeStatus.fullPayment;
        } else if (studentList[_id]._fee == feeStatus.noPayment && msg.value == fullPayment) {
            studentList[_id]._fee = feeStatus.fullPayment;
        } else {
            revert("INVALID PAYMENT ATTEMPT");
        }
    }

}
