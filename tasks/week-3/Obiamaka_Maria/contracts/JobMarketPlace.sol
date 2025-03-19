// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JobMarketPlace {
    // Owner of the contract
    address public owner;

    // Enum to track job status
    enum JobStatus { Open, Assigned, Completed, Paid }

    // Struct for job details
    struct Job {
        uint id;
        address client;
        string title;
        string description;
        uint256 budget;
        address freelancer;
        JobStatus status;
    }

    // Struct for job applications
    struct Application {
        address freelancer;
        string proposal;
        bool isApproved;
    }

    // Mapping to store jobs
    mapping(uint => Job) public jobs;
    uint public jobCount;

    // Mapping jobId => freelancer => Application details
    mapping(uint => mapping(address => Application)) public applications;

    // Events
    event JobPosted(uint jobId, address indexed client, string title, uint256 budget);
    event AppliedForJob(uint jobId, address indexed freelancer, string proposal);
    event FreelancerApproved(uint jobId, address indexed freelancer);
    event JobCompleted(uint jobId, address indexed freelancer);
    event PaymentReleased(uint jobId, address indexed client, address freelancer, uint256 amount);

    // Modifier to restrict function to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Modifier to restrict function to job's client
    modifier onlyClient(uint _jobId) {
        require(msg.sender == jobs[_jobId].client, "Only the job's client can perform this action");
        _;
    }

    // Modifier to restrict function to assigned freelancer
    modifier onlyFreelancer(uint _jobId) {
        require(msg.sender == jobs[_jobId].freelancer, "Only the assigned freelancer can perform this action");
        _;
    }

    // Constructor to set contract owner
    constructor() {
        owner = msg.sender;
    }

    // Function to post a job
    function postJob(string memory _title, string memory _description, uint256 _budget) external {
        require(_budget > 0, "Budget must be greater than zero");

        jobCount++;
        jobs[jobCount] = Job(jobCount, msg.sender, _title, _description, _budget, address(0), JobStatus.Open);

        emit JobPosted(jobCount, msg.sender, _title, _budget);
    }

    // Function for freelancers to apply for a job
    function applyForJob(uint _jobId, string memory _proposal) external {
        require(jobs[_jobId].id != 0, "Job does not exist");
        require(jobs[_jobId].status == JobStatus.Open, "Job is not open for applications");

        applications[_jobId][msg.sender] = Application(msg.sender, _proposal, false);

        emit AppliedForJob(_jobId, msg.sender, _proposal);
    }

    // Function for client to approve a freelancer
    function approveFreelancer(uint _jobId, address _freelancer) external onlyClient(_jobId) {
        require(jobs[_jobId].status == JobStatus.Open, "Job is not open for assignment");
        require(applications[_jobId][_freelancer].freelancer != address(0), "Freelancer did not apply");

        jobs[_jobId].freelancer = _freelancer;
        jobs[_jobId].status = JobStatus.Assigned;
        applications[_jobId][_freelancer].isApproved = true;

        emit FreelancerApproved(_jobId, _freelancer);
    }

    // Function for freelancer to mark job as completed
    function completeJob(uint _jobId) external onlyFreelancer(_jobId) {
        require(jobs[_jobId].status == JobStatus.Assigned, "Job is not assigned yet");

        jobs[_jobId].status = JobStatus.Completed;

        emit JobCompleted(_jobId, msg.sender);
    }

    // Function for client to release payment
    function releasePayment(uint _jobId) external payable onlyClient(_jobId) {
        require(jobs[_jobId].status == JobStatus.Completed, "Job is not completed yet");
        require(msg.value == jobs[_jobId].budget, "Payment must match the budget");

        payable(jobs[_jobId].freelancer).transfer(msg.value);
        jobs[_jobId].status = JobStatus.Paid;

        emit PaymentReleased(_jobId, msg.sender, jobs[_jobId].freelancer, msg.value);
    }

    // Fallback function to prevent accidental transfers
    receive() external payable {
        revert("Direct payments not allowed");
    }
}
