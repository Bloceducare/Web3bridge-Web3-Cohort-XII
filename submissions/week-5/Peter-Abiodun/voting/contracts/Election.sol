// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./VotingNFT.sol";

contract Election {
    VotingNFT public votingNFT;
    address public admin;
    uint256 public startTime;
    uint256 public endTime;

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    mapping(uint256 => uint256) private votes; // tokenId => candidateIndex
    mapping(address => bool) public hasVoted;
    bool public resultsAvailable;

    event VoteCasted(address indexed voter, uint256 indexed tokenId, uint256 candidateIndex);
    event ElectionCreated(uint256 startTime, uint256 endTime);
    event ElectionResults(uint256[] results);

    constructor(
        address _nftAddress,
        address _admin,
        string[] memory _candidates,
        uint256 _startTime,
        uint256 _endTime
    ) {
        votingNFT = VotingNFT(_nftAddress);
        admin = _admin;
        startTime = _startTime;
        endTime = _endTime;

        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({name: _candidates[i], voteCount: 0}));
        }

        emit ElectionCreated(_startTime, _endTime);
    }

    function vote(uint256 tokenId, uint256 candidateIndex) external {
        require(block.timestamp >= startTime, "Election has not started");
        require(block.timestamp <= endTime, "Election has ended");
        require(candidateIndex < candidates.length, "Invalid candidate");
        require(votingNFT.ownerOf(tokenId) == msg.sender);
        require(!hasVoted[msg.sender], "Already voted");

        votes[tokenId] = candidateIndex;
        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;

        emit VoteCasted(msg.sender, tokenId, candidateIndex);
    }

    function getResults() external view returns (uint256[] memory) {
        require(block.timestamp >= endTime, "Election is still active");

        uint256[] memory results = new uint256[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            results[i] = candidates[i].voteCount;
        }

        return results;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }
}
