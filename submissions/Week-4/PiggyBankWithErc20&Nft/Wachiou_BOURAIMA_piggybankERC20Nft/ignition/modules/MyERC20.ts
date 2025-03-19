// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const OurERC20Module = buildModule("OurERC20Module", (m) => {


    const token = m.contract("OurERC20");

    return { token };
});

export default OurERC20Module;
