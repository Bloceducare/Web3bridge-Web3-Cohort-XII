// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    // Struct to store vote data
    struct Vote {
        bytes32 voteHash;
        uint256 timestamp;
        bool verified;
    }

    // Election parameters
    uint256 public votingStart;
    uint256 public votingEnd;
    bool public resultsRevealed;
    bool public paused; 
    mapping(address => bool) private _reentrancyGuard; // Custom reentrancy guard
    
    // Mappings
    mapping(address => bool) public hasVoted;
    mapping(address => Vote) private votes;
    mapping(uint256 => uint256) public voteCounts;
    mapping(address => bool) public registeredVoters;
    mapping(bytes32 => bool) public usedVoteHashes;
    
    // Candidate list
    uint256[] public candidates;
    uint256 public totalVotes;
    
    // Events  are used to log actions on the blockchain
    event VoterRegistered(address indexed voter);
    event VoteCast(address indexed voter, bytes32 voteHash);
    event ResultsRevealed(uint256 timestamp);
    event EmergencyPause(bool paused);
    event VoteVerified(address indexed voter);

    constructor(
        uint256 _votingStart,
        uint256 _votingEnd,
        uint256[] memory _candidates
    ) Ownable(msg.sender) {
        require(_votingStart < _votingEnd, "Invalid voting period");
        require(_candidates.length > 0, "No candidates provided");
        
        votingStart = _votingStart;
        votingEnd = _votingEnd;
        candidates = _candidates;
        resultsRevealed = false;
        paused = false;
    }

    modifier onlyDuringVoting() {
        require(!paused, "Contract is paused");
        require(block.timestamp >= votingStart, "Voting not started");
        require(block.timestamp <= votingEnd, "Voting ended");
        _;
    }

    modifier onlyAfterVoting() {
        require(block.timestamp > votingEnd, "Voting still ongoing");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier nonReentrant() {
        require(!_reentrancyGuard[msg.sender], "Reentrancy detected");
        _reentrancyGuard[msg.sender] = true;
        _;
        _reentrancyGuard[msg.sender] = false;
    }

    // Custom pause functions
    function emergencyPause() external onlyOwner {
        paused = true;
        emit EmergencyPause(true);
    }

    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit EmergencyPause(false);
    }

    // Register eligible voters (only owner)
    function registerVoter(address _voter) external onlyOwner whenNotPaused {
        require(_voter != address(0), "Invalid voter address");
        require(!registeredVoters[_voter], "Voter already registered");
        registeredVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    // Cast vote with hashed choice
    function castVote(bytes32 _voteHash) 
        external 
        onlyDuringVoting 
        whenNotPaused 
        nonReentrant 
    {
        require(registeredVoters[msg.sender], "Not registered voter");
        require(!hasVoted[msg.sender], "Already voted");
        require(_voteHash != bytes32(0), "Invalid vote hash");
        require(!usedVoteHashes[_voteHash], "Vote hash already used");

        votes[msg.sender] = Vote({
            voteHash: _voteHash,
            timestamp: block.timestamp,
            verified: false
        });
        
        hasVoted[msg.sender] = true;
        usedVoteHashes[_voteHash] = true;
        totalVotes++;
        
        emit VoteCast(msg.sender, _voteHash);
    }

    // Verify individual vote
    function verifyVote(address _voter, bytes32 _voteHash) 
        external 
        view 
        returns (bool) 
    {
        require(hasVoted[_voter], "Voter didn't vote");
        return votes[_voter].voteHash == _voteHash;
    }

    // Reveal results after voting ends
    function revealResults(
        address[] calldata _voters,
        uint256[] calldata _candidateChoices
    ) 
        external 
        onlyOwner 
        onlyAfterVoting 
        whenNotPaused 
        nonReentrant 
    {
        require(!resultsRevealed, "Results already revealed");
        require(_voters.length == _candidateChoices.length, "Invalid input");
        require(_voters.length <= totalVotes, "Invalid voter count");

        for(uint256 i = 0; i < _voters.length; i++) {
            address voter = _voters[i];
            require(hasVoted[voter], "Voter didn't vote");
            require(!votes[voter].verified, "Vote already counted");
            
            // Verify candidate ID is valid
            bool validCandidate = false;
            for(uint256 j = 0; j < candidates.length; j++) {
                if(candidates[j] == _candidateChoices[i]) {
                    validCandidate = true;
                    break;
                }
            }
            require(validCandidate, "Invalid candidate ID");
            
            voteCounts[_candidateChoices[i]]++;
            votes[voter].verified = true;
            emit VoteVerified(voter);
        }
        
        resultsRevealed = true;
        emit ResultsRevealed(block.timestamp);
    }

    // Get election results
    function getResults() 
        external 
        view 
        returns (uint256[] memory, uint256[] memory) 
    {
        require(resultsRevealed, "Results not revealed yet");
        
        uint256[] memory candidateIds = new uint256[](candidates.length);
        uint256[] memory results = new uint256[](candidates.length);
        
        for(uint256 i = 0; i < candidates.length; i++) {
            candidateIds[i] = candidates[i];
            results[i] = voteCounts[candidates[i]];
        }
        return (candidateIds, results);
    }

    // Get voting statistics
    function getVotingStats() 
        external 
        view 
        returns (
            uint256 _totalVoters,
            uint256 _totalVotes,
            uint256 _startTime,
            uint256 _endTime,
            bool _resultsRevealed
        ) 
    {
        return (
            totalVotes,
            totalVotes,
            votingStart,
            votingEnd,
            resultsRevealed
        );
    }
}