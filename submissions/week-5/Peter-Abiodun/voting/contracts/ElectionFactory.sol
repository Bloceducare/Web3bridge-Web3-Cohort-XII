// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./VotingNFT.sol";
import "./Election.sol";

contract ElectionFactory {
    struct ElectionPoll {
        address electionContract;
        address nftContract;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => ElectionPoll) public elections;
    uint256 public electionCount;
    address public admin;

    event ElectionCreated(
        uint256 indexed electionId,
        address electionContract,
        address nftContract,
        uint256 startTime,
        uint256 endTime
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(
        string memory _name,
        // string memory _description,
        string[] memory _candidates,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_candidates.length >= 2, "At least two candidates required");

        electionCount++;
        VotingNFT votingNFT = new VotingNFT(_name);
        Election election = new Election(address(votingNFT), admin, _candidates, _startTime, _endTime);

        elections[electionCount] = ElectionPoll(address(election), address(votingNFT), _startTime, _endTime);

        emit ElectionCreated(electionCount, address(election), address(votingNFT), _startTime, _endTime);
    }
}
