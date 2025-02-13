import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SchoolManagemntModule = buildModule("SchoolManagementModule", (m) => {

  const SchoolManagement = m.contract("SchoolManagement")

  return { SchoolManagement };
});

export default SchoolManagemntModule;
