// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract SchoolManagement {
    address private principal;
    mapping(address => Pupil) public pupils; 
    mapping(address => Instructor) public instructors; 
    uint256 public currentFee;
    uint256 private contractBalance;

    event FeePaid(address pupil, uint256 amount);

    struct Pupil {
        address pupilId;
        uint8 age;
        string fullName;
    }

    struct Instructor {
        address instructorId;
        string fullName;
    }

    constructor() {
        principal = msg.sender;
    }

    modifier onlyPrincipal {
        require(principal == msg.sender, "Only the principal can perform this function.");
        _;
    }

    // Create a new pupil, only principal
    function addPupil(address _pupilId, uint8 _age, string memory _fullName) public onlyPrincipal {
        Pupil storage pupil = pupils[_pupilId];
        pupil.pupilId = _pupilId;
        pupil.age = _age;
        pupil.fullName = _fullName;
    }

    // Create a new instructor, only principal
    function addInstructor(address _instructorId, string memory _fullName) public onlyPrincipal {
        Instructor storage instructor = instructors[_instructorId];
        instructor.instructorId = _instructorId;
        instructor.fullName = _fullName;
    }

    // Set the current fee only principal
    function setFee(uint256 _fee) public onlyPrincipal {
        currentFee = _fee;
    }

    // Pay school fee
    function payFee() public payable {
        require(pupils[msg.sender].pupilId != address(0), "Only registered pupils can pay the school fee.");
        require(msg.value == currentFee, "Incorrect fee amount sent.");

        contractBalance += msg.value;
        emit FeePaid(msg.sender, msg.value);
    }

    // Withdraw funds, only principal
    function withdraw(uint256 _amount) public onlyPrincipal {
        require(_amount <= contractBalance, "Insufficient contract balance.");
        contractBalance -= _amount;
        payable(principal).transfer(_amount);
    }
}