// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Freelancer {
    
    struct Job {
        uint id;
        address client;
        address payable freelancer;
        string description;
        uint payment;
        bool completed;
    }

    uint public jobCount;
    mapping(uint => Job) public jobs;
    mapping(address => uint) public balances;
    address public owner;

    modifier onlyClient(uint _jobId) {
        require(msg.sender == jobs[_jobId].client, "Not the job owner");
        _;
    }
    
    modifier onlyFreelancer(uint _jobId) {
        require(msg.sender == jobs[_jobId].freelancer, "Not the assigned freelancer");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }
    
    event JobCreated(uint jobId, address indexed client, string description, uint payment);
    event JobAssigned(uint jobId, address indexed freelancer);
    event JobCompleted(uint jobId, address indexed freelancer);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createJob(string memory _description) public payable {
        require(msg.value > 0, "Payment must be greater than 0");
        jobCount++;
        jobs[jobCount] = Job(jobCount, msg.sender, payable(address(0)), _description, msg.value, false);
        emit JobCreated(jobCount, msg.sender, _description, msg.value);
    }
    
    function assignFreelancer(uint _jobId, address payable _freelancer) public onlyClient(_jobId) {
        require(jobs[_jobId].freelancer == address(0), "Freelancer already assigned");
        jobs[_jobId].freelancer = _freelancer;
        emit JobAssigned(_jobId, _freelancer);
    }
    
    function completeJob(uint _jobId) public onlyFreelancer(_jobId) {
        require(!jobs[_jobId].completed, "Job already completed");
        jobs[_jobId].completed = true;
        jobs[_jobId].freelancer.transfer(jobs[_jobId].payment);
        emit JobCompleted(_jobId, jobs[_jobId].freelancer);
    }
}
