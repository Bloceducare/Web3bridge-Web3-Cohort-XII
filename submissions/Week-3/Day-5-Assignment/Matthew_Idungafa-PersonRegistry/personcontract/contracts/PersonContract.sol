// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PersonRegistry {
    // Error declarations
    error NotAdmin();
    error PersonNotFound();
    error InvalidAge();

    // Events
    event PersonAdded(uint256 indexed id, string name, uint256 age);
    event PersonUpdated(uint256 indexed id, string newName, uint256 newAge);

    // Struct definition
    struct Person {
        string name;
        uint256 age;
        bool isVerified;
        uint256 registrationDate;
    }

    // State variables
    address public admin;
    uint256 private personCount;

    // Mappings
    mapping(uint256 => Person) public people;
    mapping(address => bool) public verifiers;

    // Constructor
    constructor() {
        admin = msg.sender;
        verifiers[msg.sender] = true;
    }

    // Modifiers
    modifier onlyAdmin() {
        if(msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not a verifier");
        _;
    }

    // Main functions
    function addPerson(string memory _name, uint256 _age) external onlyVerifier {
        if(_age == 0 || _age > 150) revert InvalidAge();
        
        personCount++;
        people[personCount] = Person({
            name: _name,
            age: _age,
            isVerified: false,
            registrationDate: block.timestamp
        });

        emit PersonAdded(personCount, _name, _age);
    }

    function verifyPerson(uint256 _id) external onlyVerifier {
        if(people[_id].registrationDate == 0) revert PersonNotFound();
        people[_id].isVerified = true;
    }

    function updatePerson(uint256 _id, string memory _newName, uint256 _newAge) external onlyVerifier {
        if(people[_id].registrationDate == 0) revert PersonNotFound();
        if(_newAge == 0 || _newAge > 150) revert InvalidAge();

        Person storage person = people[_id];
        person.name = _newName;
        person.age = _newAge;

        emit PersonUpdated(_id, _newName, _newAge);
    }

    function addVerifier(address _verifier) external onlyAdmin {
        verifiers[_verifier] = true;
    }

    function removeVerifier(address _verifier) external onlyAdmin {
        verifiers[_verifier] = false;
    }

    // View functions
    function getPerson(uint256 _id) external view returns (Person memory) {
        if(people[_id].registrationDate == 0) revert PersonNotFound();
        return people[_id];
    }
}