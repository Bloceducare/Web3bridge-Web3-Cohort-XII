// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskManagement {
    // State variables
    address public owner;
    uint256 public taskCount;
    
    // Struct definition
    struct Task {
        string title;
        string description;
        uint256 deadline;
        bool isCompleted;
        address assignedTo;
        uint256 reward;
    }
    
    // Mappings
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userTasks;
    mapping(address => uint256) public userRewards;
    
    // Events
    event TaskCreated(uint256 taskId, string title, address assignedTo);
    event TaskCompleted(uint256 taskId, address completedBy);
    event RewardClaimed(address user, uint256 amount);
    
    // Custom errors
    error InvalidDeadline();
    error TaskNotFound();
    error UnauthorizedAccess();
    error InsufficientReward();
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier taskExists(uint256 _taskId) {
        if (_taskId >= taskCount) revert TaskNotFound();
        _;
    }
    
    modifier onlyAssignedUser(uint256 _taskId) {
        if (tasks[_taskId].assignedTo != msg.sender) revert UnauthorizedAccess();
        _;
    }
    
    // Functions
    function createTask(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        address _assignedTo,
        uint256 _reward
    ) public onlyOwner {
        // Input validation
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_assignedTo != address(0), "Invalid address");
        
        // Create new task
        tasks[taskCount] = Task({
            title: _title,
            description: _description,
            deadline: _deadline,
            isCompleted: false,
            assignedTo: _assignedTo,
            reward: _reward
        });
        
        // Update user's task list
        userTasks[_assignedTo].push(taskCount);
        
        // Emit event
        emit TaskCreated(taskCount, _title, _assignedTo);
        
        taskCount++;
    }
    
    function completeTask(uint256 _taskId) public 
        taskExists(_taskId) 
        onlyAssignedUser(_taskId) 
    {
        Task storage task = tasks[_taskId];
        require(!task.isCompleted, "Task already completed");
        require(block.timestamp <= task.deadline, "Task deadline passed");
        
        task.isCompleted = true;
        userRewards[msg.sender] += task.reward;
        
        emit TaskCompleted(_taskId, msg.sender);
    }
    
    function claimRewards() public {
        uint256 reward = userRewards[msg.sender];
        if (reward == 0) revert InsufficientReward();
        
        // Reset rewards before transfer to prevent reentrancy
        userRewards[msg.sender] = 0;
        
        // Transfer rewards
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    function getTaskDetails(uint256 _taskId) public view 
        taskExists(_taskId) 
        returns (Task memory) 
    {
        return tasks[_taskId];
    }
    
    function getUserTasks(address _user) public view returns (uint256[] memory) {
        return userTasks[_user];
    }
    
    // Fallback function to receive ETH
    receive() external payable {}
}