// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NOT_DISPENSING_AIRDROP_AGAIN();
error AMOUNT_TOO_HIGH();
error AIRDROP_ALREADY_CLAIMED();
error INVALID_PROOF();
error INSUFFICIENT_BALANCE();
error TRANSFER_FAILED();

contract Airdrop is Ownable {
  IERC20 public immutable token;

  uint256 public constant MAX_AMOUNT = 1000e18;
  bytes32 public merkleRoot;

  mapping(address => bool) public hasClaimed;

  event AirdropClaimed(address indexed, uint256 amount);
  event WithdrawSuccessful(address indexed, uint256 amount);
  event MerkleRootUpdated(bytes32 rootByte);

  constructor(address _addr) Ownable(msg.sender) {
    token = IERC20(_addr);
  }

  // modifier onlyWhitelisted() {
  //   require(whitelisted[msg.sender], "User not whitelisted");
  //   _;
  // }

  function claim(uint256 amount, bytes32[] calldata proof) external {
    if(token.balanceOf(address(this)) < amount) revert NOT_DISPENSING_AIRDROP_AGAIN();

    if (amount > MAX_AMOUNT) revert AMOUNT_TOO_HIGH();
    
    if(hasClaimed[msg.sender]) revert AIRDROP_ALREADY_CLAIMED();

    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

    if (!MerkleProof.verify(proof, merkleRoot, leaf)) revert INVALID_PROOF();

    if(!token.transfer(msg.sender, amount)) revert TRANSFER_FAILED();

    hasClaimed[msg.sender] = true;

    emit AirdropClaimed(msg.sender, amount);
  }

  function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
    merkleRoot = _merkleRoot;

    emit MerkleRootUpdated(_merkleRoot);
  }

  function withdraw() external onlyOwner {
    if (token.balanceOf(address(this))  == 0) revert INSUFFICIENT_BALANCE();

    if (token.transfer(msg.sender, token.balanceOf(address(this)))) {
      emit WithdrawSuccessful(msg.sender, token.balanceOf(address(this)));
    } else {
      revert TRANSFER_FAILED();
    }
  }
}
