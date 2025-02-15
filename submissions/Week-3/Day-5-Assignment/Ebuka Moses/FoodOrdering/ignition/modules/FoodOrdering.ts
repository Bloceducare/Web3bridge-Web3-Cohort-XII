// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const adminAddress = "0x9997eD8442f70DC8365d8bEbB2C72644B7c9aDc4";

const FoodOrdering = buildModule("FoodOrdering", (m) => {


  const order = m.contract("FoodOrdering", [adminAddress]);

  return { order };
});

export default FoodOrdering;
// - https://sepolia.etherscan.io/address/0xd657148c0039FdDA023281BBc4A4C2a123844380#code