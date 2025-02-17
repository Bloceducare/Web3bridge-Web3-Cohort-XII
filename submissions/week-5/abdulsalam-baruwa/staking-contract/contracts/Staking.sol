// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking {
    address public owner; // amt of tokens staked by an address
    IERC20 public stakingToken;
    struct Position {
        uint positionId;
        address walletAddress;
        uint createdDate;
        uint unlockDate;
        uint percentInterest;
        uint amountStaked;
        uint tokenInterest;
        bool open;
    }
    Position position;
    uint public currentPositionId;
    mapping(uint => Position) public positions;
    mapping(address => uint[]) public positionIdsByAddress;
    mapping(uint => uint) public tiers;
    uint[] public lockPeriods; // 30 days / 90 days / 180 days

    constructor(IERC20 _stakingToken) payable {
        owner = msg.sender;
        currentPositionId = 0;
        stakingToken = _stakingToken;
        tiers[30] = 700; // 30 days -> 7%
        tiers[90] = 1000; // 90 days -> 10%
        tiers[180] = 1200; // 180 days -> 12%
        lockPeriods.push(30);
        lockPeriods.push(90);
        lockPeriods.push(180);
    }

function stake(uint numDays, uint amount) external {
    require(tiers[numDays] > 0, "Mapping not found");
    require(stakingToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
    positions[currentPositionId] = Position(
        currentPositionId,
        msg.sender,
        block.timestamp,
        block.timestamp + (numDays * 1 days),
        tiers[numDays],
        amount,
        calculateInterest(tiers[numDays], numDays, amount),
        true
    );
    positionIdsByAddress[msg.sender].push(currentPositionId);
    currentPositionId += 1;
}

function closePosition(uint positionId) external {
    require(
        positions[positionId].walletAddress == msg.sender,
        "Only position creator can modify the position"
    );
    require(positions[positionId].open == true, "Position is closed");
    positions[positionId].open = false;
    if (block.timestamp > positions[positionId].unlockDate) {
        uint amount = positions[positionId].amountStaked +
            positions[positionId].tokenInterest;
        require(stakingToken.transfer(msg.sender, amount), "Token transfer failed");
    } else {
        require(stakingToken.transfer(msg.sender, positions[positionId].amountStaked), "Token transfer failed");
    }
}

    function calculateInterest(
        uint basisPoints,
        uint,
        uint weiAmount
    ) private pure returns (uint) {
        return (basisPoints * weiAmount) / 10000;
    }

    function modifyLockPeriods(uint numDays, uint basisPoints) external {
        require(owner == msg.sender, "Only owner may modify staking periods");
        tiers[numDays] = basisPoints;
        lockPeriods.push(numDays);
    }

    function getLockPeriods() external view returns (uint[] memory) {
        return lockPeriods;
    }

    function getInterestRate(uint numDays) external view returns (uint) {
        return tiers[numDays];
    }

    function getPositionById(
        uint positionId
    ) external view returns (Position memory) {
        return positions[positionId];
    }

    function getPositionIdsForAddress(
        address walletAddress
    ) external view returns (uint[] memory) {
        return positionIdsByAddress[walletAddress];
    }
}
