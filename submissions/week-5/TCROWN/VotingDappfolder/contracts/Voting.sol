// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Voting is Ownable, ReentrancyGuard {
    struct Candidate {
        string name;
        string ipfsHash;
        uint256 votes;
    }

    struct Election {
        string pollTitle;
        string country;
        uint256 startTime;
        uint256 endTime;
        Candidate[] candidates;
        mapping(string => uint256) candidateVotes; // Maps candidate name to vote count
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Election) public elections;
    uint256 public electionCount;

    event ElectionCreated(uint256 indexed electionId, string pollTitle, string country, uint256 startTime, uint256 endTime);
    event VoterRegistered(address indexed voter, string country);
    event VoteCast(uint256 indexed electionId, address voter, string candidate);

    /**
     * @dev Creates a new election.
     */
    function createElection(
    string memory _pollTitle,
    string memory _country,
    uint256 _startTime,
    uint256 _endTime,
    string[] memory _candidateNames,
    string[] memory _candidateIpfsHashes
) external onlyOwner {
    require(_endTime > block.timestamp, "End time must be in the future");
    require(_startTime < _endTime, "Start time must be before end time");
    require(bytes(_pollTitle).length > 0, "Poll title cannot be empty");
    require(bytes(_country).length > 0, "Country cannot be empty");
    require(_candidateNames.length > 0, "At least one candidate is required");

    electionCount++;
    Election storage newElection = elections[electionCount];
    newElection.pollTitle = _pollTitle;
    newElection.country = _country;
    newElection.startTime = _startTime;
    newElection.endTime = _endTime;

    for (uint256 i = 0; i < _candidateNames.length; i++) {
        require(bytes(_candidateNames[i]).length > 0, "Candidate name cannot be empty");
        require(newElection.candidateVotes[_candidateNames[i]] == 0, "Duplicate candidate names are not allowed");
        
        newElection.candidates.push(Candidate({
            name: _candidateNames[i],
            ipfsHash: _candidateIpfsHashes[i],
            votes: 0
        }));
        newElection.candidateVotes[_candidateNames[i]] = 0;
    }

    emit ElectionCreated(electionCount, _pollTitle, _country, _startTime, _endTime);
}


    /**
     * @dev Registers a voter.
     */
    function registerVoter(string memory _country) external {
        require(bytes(_country).length > 0, "Country cannot be empty");
        emit VoterRegistered(msg.sender, _country);
    }

    /**
     * @dev Allows a registered voter to cast a vote.
     */
    function vote(uint256 _electionId, string memory _candidateName) external nonReentrant {
    Election storage election = elections[_electionId];
    require(block.timestamp >= election.startTime && block.timestamp <= election.endTime, "Voting is not open");
    require(!election.hasVoted[msg.sender], "You have already voted");
    require(candidateExists(election, _candidateName), "Candidate does not exist");

    election.hasVoted[msg.sender] = true;
    election.candidateVotes[_candidateName]++;

    for (uint256 i = 0; i < election.candidates.length; i++) {
        if (keccak256(abi.encodePacked(election.candidates[i].name)) == keccak256(abi.encodePacked(_candidateName))) {
            election.candidates[i].votes++;
            break;
        }
    }

    emit VoteCast(_electionId, msg.sender, _candidateName);
}

    /**
     * @dev Retrieves details of an election.
     */
    function getElection(uint256 _electionId) external view returns (
        string memory pollTitle,
        string memory country,
        uint256 startTime,
        uint256 endTime,
        Candidate[] memory candidates,
        uint256[] memory votes
    ) {
        Election storage election = elections[_electionId];
        pollTitle = election.pollTitle;
        country = election.country;
        startTime = election.startTime;
        endTime = election.endTime;
        candidates = election.candidates;

        votes = new uint256[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            votes[i] = election.candidateVotes[candidates[i].name];
        }
    }

            function getCandidateVotes(uint256 _electionId, string memory _candidateName) external view returns (uint256) {
        Election storage election = elections[_electionId];
        require(candidateExists(election, _candidateName), "Candidate does not exist");
        return election.candidateVotes[_candidateName];
    }

    /**
     * @dev Determines the winner of an election.
     */
    function getWinner(uint256 _electionId) external view returns (string memory) {
        Election storage election = elections[_electionId];
        require(block.timestamp > election.endTime, "Election has not ended yet");

        string memory winner;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < election.candidates.length; i++) {
            string memory candidateName = election.candidates[i].name;
            uint256 candidateVotes = election.candidateVotes[candidateName];

            if (candidateVotes > maxVotes) {
                maxVotes = candidateVotes;
                winner = candidateName;
            }
        }

        return winner;
    }

    
        function getWinner(uint256 _electionId) external view returns (string memory winner) {
    Election storage election = elections[_electionId];
    require(block.timestamp > election.endTime, "Election has not ended yet");

    uint256 maxVotes = 0;
    bool isTie = false;

    for (uint256 i = 0; i < election.candidates.length; i++) {
        uint256 candidateVotes = election.candidateVotes[election.candidates[i].name];

        if (candidateVotes > maxVotes) {
            maxVotes = candidateVotes;
            winner = election.candidates[i].name;
            isTie = false;
        } else if (candidateVotes == maxVotes && maxVotes > 0) {
            isTie = true;
        }
    }

    require(!isTie, "There is a tie, no single winner");
    }

    /**
     * @dev Retrieves the number of votes for a specific candidate in an election.
     */
    function getCandidateVotes(uint256 _electionId, string memory _candidateName) external view returns (uint256) {
        return elections[_electionId].candidateVotes[_candidateName];
    }

    /**
     * @dev Checks if a candidate exists in an election.
     */
    function candidateExists(Election storage election, string memory _candidateName) internal view returns (bool) {
        for (uint256 i = 0; i < election.candidates.length; i++) {
            if (keccak256(abi.encodePacked(election.candidates[i].name)) == keccak256(abi.encodePacked(_candidateName))) {
                return true;
            }
        }
        return false;
    }
}