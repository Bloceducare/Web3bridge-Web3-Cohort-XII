// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DecentralizedCrowdfunding {
    struct Project {
        address creator;
        IERC20 token;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool fundsReleased;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public projectCount;

    error OnlyCreator();
    error GoalNotMet();
    error GoalAlreadyReached();
    error DeadlinePassed();
    error InsufficientContribution();
    error TransferFailed();

    event ProjectCreated(uint256 indexed projectId, address indexed creator, uint256 goal, uint256 deadline);
    event ContributionMade(uint256 indexed projectId, address indexed backer, uint256 amount);
    event FundsReleased(uint256 indexed projectId);
    event RefundIssued(uint256 indexed projectId, address indexed backer, uint256 amount);

    function createProject(IERC20 _token, uint256 _goal, uint256 _duration) external {
        require(_goal > 0, "Goal must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");

        projectCount++;
        projects[projectCount] = Project({
            creator: msg.sender,
            token: _token,
            goal: _goal,
            deadline: block.timestamp + _duration,
            amountRaised: 0,
            fundsReleased: false
        });

        emit ProjectCreated(projectCount, msg.sender, _goal, block.timestamp + _duration);
    }

    function contribute(uint256 _projectId, uint256 _amount) external {
        Project storage project = projects[_projectId];
        if (block.timestamp > project.deadline) revert DeadlinePassed();
        if (_amount == 0) revert InsufficientContribution();

        bool success = project.token.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert TransferFailed();

        contributions[_projectId][msg.sender] += _amount;
        project.amountRaised += _amount;

        emit ContributionMade(_projectId, msg.sender, _amount);
    }

    function releaseFunds(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        if (msg.sender != project.creator) revert OnlyCreator();
        if (project.amountRaised < project.goal) revert GoalNotMet();
        if (project.fundsReleased) revert GoalAlreadyReached();

        project.fundsReleased = true;
        bool success = project.token.transfer(project.creator, project.amountRaised);
        if (!success) revert TransferFailed();

        emit FundsReleased(_projectId);
    }

    function claimRefund(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        if (project.amountRaised >= project.goal) revert GoalAlreadyReached();

        uint256 contributed = contributions[_projectId][msg.sender];
        if (contributed == 0) revert InsufficientContribution();

        contributions[_projectId][msg.sender] = 0;
        bool success = project.token.transfer(msg.sender, contributed);
        if (!success) revert TransferFailed();

        emit RefundIssued(_projectId, msg.sender, contributed);
    }
}
