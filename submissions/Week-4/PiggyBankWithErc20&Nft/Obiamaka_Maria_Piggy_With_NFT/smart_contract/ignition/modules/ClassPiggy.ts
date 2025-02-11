// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OurPiggyBankModule = buildModule("OurPiggyBankModule", (m) => {


    // constructor (uint256 _targetAmount, uint256
      
    //_withdrawalDate, address _manager, address tokenAddress) 

    const name = "Cohort XII";
    const symbol = "CXII";
  const erc = m.contract("OurPiggyBank", [name, symbol]);


  return { erc };
});

export default OurPiggyBankModule;