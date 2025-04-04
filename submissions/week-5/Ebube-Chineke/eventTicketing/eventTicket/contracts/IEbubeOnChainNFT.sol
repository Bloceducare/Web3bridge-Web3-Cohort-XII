// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEbubeOnChainNFT {
    function generateCharacter(uint256 tokenId) external pure returns (string memory);
    function getTokenURI(uint256 tokenId) external pure returns (string memory);
    function mint() external;
    function mintForAddress(address _address) external;
    function balanceOf(address owner) external view returns (uint256);
}
