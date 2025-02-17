// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract VotingSystem {
    // This struct to represent a candidate
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // state variables
    address public owner;
    uint256 public candidateCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    // restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can do this");
        _;
    }

    // ensure a voter can vote only once
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // add a candidate 
    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    // vote for a candidate (Identify candiate to vote for using their Id)
    function vote(uint256 _candidateId) public hasNotVoted {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender] = true;
    }

    // get the total votes for a candidate
    function getVotes(uint256 _candidateId) public view returns (uint256) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }
}