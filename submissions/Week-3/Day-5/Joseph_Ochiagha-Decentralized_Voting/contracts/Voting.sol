// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DecentralizedVoting {
    address public admin;
    
    struct Candidate {
        string name;
        uint256 voteCount;
    }
    
    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;
    mapping(string => bool) private candidateExists;
    
    event CandidateAdded(string name);
    event Voted(address voter, string candidate);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }
    
    constructor(string[] memory candidateNames) {
        admin = msg.sender;
        for (uint256 i = 0; i < candidateNames.length; i++) {
            addCandidate(candidateNames[i]);
        }
    }
    
    function addCandidate(string memory _name) public onlyAdmin {
        require(!candidateExists[_name], "Candidate already exists");
        candidates.push(Candidate(_name, 0));
        candidateExists[_name] = true;
        emit CandidateAdded(_name);
    }
    
    function vote(uint256 candidateIndex) public hasNotVoted {
        require(candidateIndex < candidates.length, "Invalid candidate index");
        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
        emit Voted(msg.sender, candidates[candidateIndex].name);
    }
    
    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }
    
    function getCandidate(uint256 index) public view returns (string memory, uint256) {
        require(index < candidates.length, "Invalid candidate index");
        Candidate memory candidate = candidates[index];
        return (candidate.name, candidate.voteCount);
    }
}
