// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AkpoloAirdrop is Ownable(msg.sender) {

    IERC20 public token;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;

    uint public dropAmount;

    event TransferDrop(address _to, uint amount);
    event Withdraw(address _to, uint amount);

    constructor(address _token, uint _amount, bytes32 _merkleRoot) {
        require(address(_token) != address(0), "REJECT with 0 address");
        require(_amount > 0, "Rejected, Need be more than 0");
        token = IERC20(_token);
        dropAmount = _amount;
        merkleRoot = _merkleRoot;
    }

    function getDrop(bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], 'Already claimed airdrop');
        require(msg.sender != address(0), "0 address REJECTED");

        // Verify Merkle Proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle Proof");

        hasClaimed[msg.sender] = true;
        token.transfer(msg.sender, dropAmount);
        emit TransferDrop(msg.sender, dropAmount);
    }

    function getBalance() public view onlyOwner returns (uint) {
        return token.balanceOf(address(this));
    }

    function withdraw() external onlyOwner {
        uint remainedAmount = getBalance();
        require(remainedAmount > 0, "REJECTED");
        token.transfer(owner(), remainedAmount);
        emit Withdraw(owner(), remainedAmount);
    }

    function changeDropAmount(uint _newAmount) external onlyOwner {
        require(_newAmount > 0, "Rejected, need more amount");
        dropAmount = _newAmount;
    }

    function newToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "REJECTED");
        token = IERC20(_newToken);
    }

    function changeMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        merkleRoot = _newMerkleRoot;
    }

    function resetClaimStatus(address _address) external onlyOwner {
        hasClaimed[_address] = false;
    }
}