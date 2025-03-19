// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const OurERC721Module = buildModule("OurERC721Module", (m) => {


    const token = m.contract("OurERC721");

    return { token };
});

export default OurERC721Module;
