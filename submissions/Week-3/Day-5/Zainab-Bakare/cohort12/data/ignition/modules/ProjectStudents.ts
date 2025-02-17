// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ProjectStudentsModule = buildModule("ProjectStudentsModule", (m) => {

  const projectStudents = m.contract("ProjectStudents" );

  return { projectStudents};
});

export default ProjectStudentsModule;
