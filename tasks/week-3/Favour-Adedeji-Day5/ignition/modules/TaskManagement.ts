// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TaskManagementModule = buildModule("TaskManagementModule", (m) => {

  const taskManagement = m.contract("TaskManagement");

  return { taskManagement };
});

export default TaskManagementModule;
