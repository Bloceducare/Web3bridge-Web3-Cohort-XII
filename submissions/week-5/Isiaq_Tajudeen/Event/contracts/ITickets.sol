// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface Itickets {
    function safeMint(address to) external; // Remove the returns (bool)
}
