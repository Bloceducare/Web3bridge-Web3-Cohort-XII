import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TaskPledgeModule", (m) => {
    const taskPledge = m.contract("TaskPledge");
    return { taskPledge };
});
