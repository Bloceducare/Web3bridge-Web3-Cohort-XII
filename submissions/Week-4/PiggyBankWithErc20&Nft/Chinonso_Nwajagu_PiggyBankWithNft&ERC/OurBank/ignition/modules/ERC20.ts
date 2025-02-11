import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OurERC20Module = buildModule("OurERC20Module", (m) => {

    const name = "Cohort XII";
    const symbol = "CXII";
  const erc = m.contract("OurERC20", [name, symbol]);

  return { erc };
});

export default OurERC20Module;