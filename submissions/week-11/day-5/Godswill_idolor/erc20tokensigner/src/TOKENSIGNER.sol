// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

contract TOKENSIGNER is ERC20 {
    constructor() ERC20("TokenSigner", "TKS") {}

    function mintWithSignature(address y, uint256 amount, bytes memory signature) public {
        cverify(y, amount, signature);
        _mint(y, amount);
    }

    function cverify(address x, uint256 y, bytes memory sig) internal view {
        bytes32 h = keccak256(abi.encodePacked(x, y));
        h = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", h)
        );
        if (ECDSA.recover(h, sig) != x) revert("NOMINT");
    }
} 