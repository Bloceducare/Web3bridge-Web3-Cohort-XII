// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;


contract SMS { 

    enum feeStatus {
        notPaid,
        halfPaid,
        fullPaid
    }

    struct Staff {
        uint id;
        string name;
        string role;
        string gender;
        bool teachingStaff;
        address staffAddress;
        bool isRegistered; 

    }

    struct Student {
        uint id;
        string name;
        uint DOB;
        string class;
        feeStatus fee;
        string gender;
        bool isRegistered;
        address studentAddress;
        
    }

    address public owner;
    Staff[] public listOfStaff;
    mapping(uint256 => Staff) public idToStaff;
    mapping (address => bool) public staffCheck;
    uint256 public staffCounter;
    mapping(uint256 => Student) public idToStudent;
    Student[] public listOfStudent;

    uint256 public constant halfPayment  = 0.01 ether;
    uint256 public constant fullPayment = 0.02 ether;

    constructor () {
        owner = msg.sender;
    }

    modifier onlyPrincipal()  {
        require(msg.sender == owner, "Not the Principal");


        _;
    }

    modifier onlyStaff() {
        require( msg.sender ==owner || staffCheck[msg.sender] , "Only the principal and staff can register student");
        

        _;
    }

    function registerStaff(string memory _name, string memory _role, string memory _gender, uint256 _id,  address _staffAddress) external  onlyPrincipal{
        
        require(!idToStaff[_id].isRegistered, "staff already registered");

       

        listOfStaff.push(
            idToStaff[_id]= Staff({
            id: _id,
            name: _name,
            role: _role,
            gender: _gender,
            staffAddress: _staffAddress,
            teachingStaff: true || false,
            isRegistered :true
        })
        );
        staffCheck[_staffAddress] = true;
        staffCounter++;


       
        
    }

    function getAllStaff()public view returns (Staff[] memory) {
        return listOfStaff;
    }

    
        function registerStudent(string memory _name, string memory _class, string memory _gender, uint256 _id, uint256 _dob, feeStatus _fee, address _addy) external onlyStaff{
        
        require(!idToStudent[_id].isRegistered, "student already registered");

       

       
            idToStudent[_id]= Student({
            id: _id,
            name: _name,
            DOB: _dob,
            class: _class,
            gender: _gender,
            fee: _fee,
            isRegistered :true,
            studentAddress: _addy
        });
        
       
        }

        function paySchoolFees( uint256 _id) external payable {
            require(idToStudent[_id ].isRegistered, "Student is not Registered");
            
            require(idToStudent[_id].fee != feeStatus.fullPaid, "Fees already fully paid");
            require(msg.value == halfPayment || msg.value == fullPayment, "you must pay part or full payment");
            if (idToStudent[_id].fee == feeStatus.notPaid && msg.value == halfPayment) {

            idToStudent[_id].fee = feeStatus.halfPaid;

            } else if (idToStudent[_id].fee == feeStatus.halfPaid && msg.value == halfPayment) {
                idToStudent[_id].fee = feeStatus.fullPaid;

            } else if (idToStudent[_id].fee == feeStatus.notPaid && msg.value == fullPayment) {
                idToStudent[_id].fee = feeStatus.fullPaid;

            } else {
                revert("Invalid payment attempt");
            }
            
        }
}