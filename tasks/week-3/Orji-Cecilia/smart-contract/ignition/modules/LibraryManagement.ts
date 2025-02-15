// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LIBRARY_NAME = "My Decentralized Library";

const LibraryManagementModule = buildModule("LibraryManagementModule", (m) => {
  const libraryName = m.getParameter("libraryName", LIBRARY_NAME);

  const libraryManagement = m.contract("LibraryManagement", [libraryName]);

  return { libraryManagement };
});

export default LibraryManagementModule;
