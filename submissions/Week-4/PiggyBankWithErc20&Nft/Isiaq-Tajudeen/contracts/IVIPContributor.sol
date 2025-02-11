// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IVIPContributor {
    function safeMint(address _to) external returns (bool);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 tokenId
    ) external returns (bool);
}
