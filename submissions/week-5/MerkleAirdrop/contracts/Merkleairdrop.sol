// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MerkleAirdrop {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public claimed;

    event Claim(address indexed claimer);

    constructor(address _token, bytes32 _merkleRoot) {
        require(_token != address(0), "MerkleAirdrop: Invalid token address");
        require(_merkleRoot != bytes32(0), "MerkleAirdrop: Invalid merkle root");

        token = _token;
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev Allows users to claim tokens if they are eligible based on the Merkle proof.
     * @param merkleProof The Merkle proof proving the user is eligible.
     */
    function claim(bytes32[] calldata merkleProof) external {
        require(
            canClaim(msg.sender, merkleProof),
            "MerkleAirdrop: Address is not a candidate for claim"
        );

        claimed[msg.sender] = true;

        IERC20(token).safeTransfer(msg.sender, 1 ether);

        emit Claim(msg.sender);
    }

    /**
     * @dev Checks if the caller is eligible to claim tokens.
     * @param claimer The address of the user.
     * @param merkleProof The Merkle proof proving the user is eligible.
     * @return bool True if the caller is eligible to claim tokens, false otherwise.
     */
    function canClaim(address claimer, bytes32[] calldata merkleProof)
        public
        view
        returns (bool)
    {
        return
            !claimed[claimer] && // User must not have already claimed
            MerkleProof.verify(
                merkleProof,
                merkleRoot,
                keccak256(abi.encodePacked(claimer)) // Hash the claimer address
            );
    }
}
