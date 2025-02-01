// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    
    // Struct for defining a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // State variables
    address public owner;
    uint public candidateCount;
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    // Events to log voting actions
    event CandidateAdded(uint indexed candidateId, string name);
    event Voted(address indexed voter, uint indexed candidateId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier hasNotVoted() {
        require(!voters[msg.sender], "You have already voted");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        candidateCount = 0;
    }

    // Function to add a new candidate
    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        emit CandidateAdded(candidateCount, _name);
    }

    // Function to vote for a candidate
    function vote(uint _candidateId) public hasNotVoted {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        candidates[_candidateId].voteCount += 1;
        voters[msg.sender] = true;
        emit Voted(msg.sender, _candidateId);
    }

    // Function to get the total votes for a candidate
    function getCandidateVotes(uint _candidateId) public view returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }

    // Function to get the total number of candidates
    function getCandidateCount() public view returns (uint) {
        return candidateCount;
    }

    // Function to get the winner of the election
    function getWinner() public view returns (uint winnerId, string memory winnerName, uint voteCount) {
        require(candidateCount > 0, "No candidates have been added");
        uint winningVoteCount = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winnerId = i;
                winnerName = candidates[i].name;
                voteCount = candidates[i].voteCount;
                winningVoteCount = voteCount;
            }
        }
    }
}