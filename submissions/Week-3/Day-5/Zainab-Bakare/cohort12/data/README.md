This is my etherscan link: https://sepolia.etherscan.io/address/0x6688aC76DBa18ad4a24a5D4C21d05DEA7d1Fc017#code

This is my contract Contract address: 0x6688aC76DBa18ad4a24a5D4C21d05DEA7d1Fc017


ProfessorStudent Smart Contract

Overview

The ProfessorStudent smart contract is designed to facilitate a simple professor-student interaction on the blockchain. It allows a professor to register students and assign grades while ensuring access control through modifiers.

Features

Professor Access Control: Only the professor can add students and assign grades.

Student Registration: Students must be registered before they can receive grades.

Grade Assignment: The professor can assign grades to registered students.

Student Grade Retrieval: Students can check their own grades.

Event Logging: Emits events when students are registered and grades are assigned.

Contract Details

State Variables

professor: Stores the address of the professor (contract deployer).

students: A mapping that stores student details (id, name, grade, isRegistered).

Structs

Student: Holds student data:

id: Unique identifier for the student.

name: Name of the student.

grade: Grade assigned to the student (0-100).

isRegistered: Boolean flag to check if the student is registered.

Modifiers

onlyProfessor: Restricts access to only the professor.

studentExists: Ensures the student is registered before performing certain actions.

Functions

constructor(): Sets the deployer as the professor.

addStudent(address studentAddress, uint256 id, string memory name): Registers a student.

assignGrade(address studentAddress, uint8 grade): Assigns a grade to a registered student.

getStudentGrade(): Allows students to check their own grades.

Events

StudentAdded: Triggered when a student is registered.

GradeAssigned: Triggered when a grade is assigned to a student.



