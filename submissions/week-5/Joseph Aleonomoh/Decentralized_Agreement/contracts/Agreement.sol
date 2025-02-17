// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./interfaces/IAgreementNft.sol";
import "./interfaces/IToken.sol";


error Unauthorized();
error InvalidAmount();
error InvalidNftBalance();
error AlreadySigned();

contract Agreement {
    address public nftAddress;
    uint256 public amount;
    address public owner;
    address public tokenAddress;
    mapping(address => bool) public isSigned;
    
    constructor(address _nftAddress, uint256 _amount, address _tokenAddress) {
        nftAddress = _nftAddress;
        amount = _amount;
        owner = msg.sender;
        tokenAddress = _tokenAddress; 
        
    }


    event Agreed(address indexed signer, uint256 amount);

    function Agree(address signer) public {
        if(signer == address(0)) revert Unauthorized();
        if(amount <= 0) revert InvalidAmount();
        if(IAgreementNft(nftAddress).balanceOf(address(this)) < 1) revert InvalidNftBalance();
        if(isSigned[signer]) revert AlreadySigned();

        IAgreementNft(nftAddress).transfer(signer, 1);
        IToken(tokenAddress).transfer(owner, amount);
        isSigned[signer] = true;

        emit Agreed(signer, amount);

    }
}