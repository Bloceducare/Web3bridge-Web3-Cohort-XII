// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TaskPledge {
    address public owner;
    
    struct Task {
        string description;
        uint256 deadline;
        uint256 pledgeAmount;
        address creator;
        bool completed;
        address charity;
    }
    
    mapping(uint256 => Task) public tasks;
    uint256 public taskCounter;
    mapping(address => bool) public approvedCharities;

    event TaskCreated(uint256 taskId, address creator, uint256 pledgeAmount, uint256 deadline);
    event TaskCompleted(uint256 taskId, address creator);
    event TaskFailed(uint256 taskId, address charity, uint256 amount);
    event CharityAdded(address charity);
    event CharityRemoved(address charity);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyTaskCreator(uint256 _taskId) {
        require(msg.sender == tasks[_taskId].creator, "Not task creator");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCharity(address _charity) external onlyOwner {
        approvedCharities[_charity] = true;
        emit CharityAdded(_charity);
    }

    function removeCharity(address _charity) external onlyOwner {
        approvedCharities[_charity] = false;
        emit CharityRemoved(_charity);
    }

    function createTask(string memory _description, uint256 _deadline, address _charity) external payable {
        require(bytes(_description).length > 0, "Description required");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value > 0, "Pledge amount must be greater than zero");
        require(approvedCharities[_charity], "Charity not approved");
        
        taskCounter++;
        tasks[taskCounter] = Task(_description, _deadline, msg.value, msg.sender, false, _charity);
        
        emit TaskCreated(taskCounter, msg.sender, msg.value, _deadline);
    }

    function completeTask(uint256 _taskId) external onlyTaskCreator(_taskId) {
        Task storage task = tasks[_taskId];
        require(block.timestamp <= task.deadline, "Deadline passed");
        require(!task.completed, "Task already completed");
        
        task.completed = true;
        payable(task.creator).transfer(task.pledgeAmount);
        emit TaskCompleted(_taskId, task.creator);
    }

    function checkTaskFailure(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(block.timestamp > task.deadline, "Task deadline not reached");
        require(!task.completed, "Task already completed");
        
        payable(task.charity).transfer(task.pledgeAmount);
        emit TaskFailed(_taskId, task.charity, task.pledgeAmount);
    }
}
