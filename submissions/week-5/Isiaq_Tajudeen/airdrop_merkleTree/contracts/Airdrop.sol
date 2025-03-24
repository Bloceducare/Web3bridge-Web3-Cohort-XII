// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// Custom errors for gas optimization
error HasAlreadyClaimedAirdrop();
error NotOwner();
error AddressZeroDetected();
error AirdropNotActive();
error AirdropIsPaused();
error InvalidTimeRange();

contract Airdrop is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable tokenAddress;

    bytes32 public merkleRootHash;
    address public owner;
    uint256 public airdropStartTime;
    uint256 public airdropEndTime;
    bool public isPaused;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(
        address indexed claimer,
        uint256 amountClaimed,
        uint256 timestamp
    );
    event AirdropRemBalWithdrawn(uint256 tokenBalance, string successMessage);
    event AirdropPaused(bool isPaused);
    event AirdropTimeUpdated(uint256 startTime, uint256 endTime);
    event MerkleRootUpdated(bytes32 newRoot);

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }

        _;
    }

    modifier whenNotPaused() {
        if (isPaused) {
            revert AirdropIsPaused();
        }

        _;
    }

    modifier isAirdropActive() {
        if (
            block.timestamp < airdropStartTime ||
            block.timestamp > airdropEndTime
        ) {
            revert AirdropNotActive();
        }
        _;
    }

    constructor(
        bytes32 _merkleRootHash,
        address _tokenAddress,
        uint256 _startTime,
        uint256 _endTime
    ) {
        if (_tokenAddress == address(0)) revert AddressZeroDetected();
        if (_startTime >= _endTime) revert InvalidTimeRange();

        tokenAddress = IERC20(_tokenAddress);
        merkleRootHash = _merkleRootHash;
        owner = msg.sender;
        airdropStartTime = _startTime;
        airdropEndTime = _endTime;
    }

    function claimAirdrop(
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) external whenNotPaused isAirdropActive {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (hasClaimed[msg.sender]) revert HasAlreadyClaimedAirdrop();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        bool proofValid = MerkleProof.verify(
            _merkleProof,
            merkleRootHash,
            leaf
        );
        require(proofValid, "Invalid Merkle proof");

        hasClaimed[msg.sender] = true;

        require(
            tokenAddress.balanceOf(address(this)) >= _amount,
            "Insufficient balance"
        );
        tokenAddress.safeTransfer(msg.sender, _amount);

        emit AirdropClaimed(msg.sender, _amount, block.timestamp);
    }

    // function updateMerkleRoot(bytes32 _merkleRootHash) external onlyOwner {
    //     merkleRootHash = _merkleRootHash;
    //     emit MerkleRootUpdated(_merkleRootHash);
    // }

    function setAirdropTiming(
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        if (_startTime >= _endTime) revert InvalidTimeRange();
        airdropStartTime = _startTime;
        airdropEndTime = _endTime;
        emit AirdropTimeUpdated(_startTime, _endTime);
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
        emit AirdropPaused(isPaused);
    }

    function withdrawRemainingTokens() external onlyOwner {
        uint256 tokenBalance = tokenAddress.balanceOf(address(this));
        require(tokenBalance > 0, "No tokens to withdraw");

        tokenAddress.safeTransfer(owner, tokenBalance);
        emit AirdropRemBalWithdrawn(tokenBalance, "Withdrawal successful");
    }

    function checkClaimed(address _user) external view returns (bool) {
        return hasClaimed[_user];
    }
}
