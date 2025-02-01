const { ethers } = require("hardhat");

module.exports = [
  [
    ethers.encodeBytes32String("Proposal 1"),
    ethers.encodeBytes32String("Proposal 2"),
    ethers.encodeBytes32String("Proposal 3")
  ]
];
