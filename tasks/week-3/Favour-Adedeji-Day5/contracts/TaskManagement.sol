// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskManagement {
    // Struct to define a task
    struct Task {
        uint id;
        string description;
        address assignedTo;
        bool completed;
    }

    // State variables
    address public owner;
    uint private taskCounter;
    mapping(uint => Task) public tasks;
    mapping(address => uint) public userTaskCount;

    // Events
    event TaskCreated(uint taskId, string description, address assignedTo);
    event TaskCompleted(uint taskId, address completedBy);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier validTask(uint taskId) {
        require(tasks[taskId].id != 0, "Task does not exist");
        _;
    }

    modifier onlyAssignee(uint taskId) {
        require(tasks[taskId].assignedTo == msg.sender, "Not assigned to this task");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        taskCounter = 1;
    }

    // Function to create a task
    function createTask(string memory _description, address _assignedTo) external onlyOwner {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_assignedTo != address(0), "Invalid address");

        uint taskId = taskCounter++;
        tasks[taskId] = Task(taskId, _description, _assignedTo, false);
        userTaskCount[_assignedTo]++;
        emit TaskCreated(taskId, _description, _assignedTo);
    }

    // Function to mark a task as completed
    function completeTask(uint taskId) external validTask(taskId) onlyAssignee(taskId) {
        require(!tasks[taskId].completed, "Task already completed");
        tasks[taskId].completed = true;
        emit TaskCompleted(taskId, msg.sender);
    }
}
