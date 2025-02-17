// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DecentralizedVoting {
    address public owner;
    bool public electionActive;
    uint public electionEndTime;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint votedCandidateId;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    uint public candidatesCount;

    event ElectionStarted(uint duration);
    event CandidateAdded(uint candidateId, string name);
    event Voted(address indexed voter, uint candidateId);
    event ElectionEnded(uint winnerId, string winnerName, uint voteCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyDuringElection() {
        require(electionActive, "No active election");
        require(block.timestamp < electionEndTime, "Election period over");
        _;
    }

    constructor() {
        owner = msg.sender;
        electionActive = false;
    }

    function startElection(uint durationInMinutes) external onlyOwner {
        require(!electionActive, "Election already active");
        require(durationInMinutes > 0, "Invalid duration");

        electionActive = true;
        electionEndTime = block.timestamp + (durationInMinutes * 1 minutes);
        candidatesCount = 0;

        emit ElectionStarted(durationInMinutes);
    }

    function addCandidate(string calldata _name) external onlyOwner {
        require(electionActive, "Start election first");
        require(bytes(_name).length > 0, "Candidate name required");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);

        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint candidateId) external onlyDuringElection {
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate");

        voters[msg.sender] = Voter(true, candidateId);
        candidates[candidateId].voteCount++;

        emit Voted(msg.sender, candidateId);
    }

    function endElection() external onlyOwner {
        require(electionActive, "No active election");
        require(block.timestamp >= electionEndTime, "Election still running");

        electionActive = false;
        uint winningVoteCount = 0;
        uint winnerId = 0;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerId = i;
            }
        }

        emit ElectionEnded(winnerId, candidates[winnerId].name, winningVoteCount);
    }

    function getCandidate(uint candidateId) external view returns (string memory, uint) {
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate");

        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount);
    }

    function hasVoted(address _voter) external view returns (bool) {
        return voters[_voter].hasVoted;
    }
}
