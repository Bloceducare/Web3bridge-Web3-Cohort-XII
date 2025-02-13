import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const SimpleLibraryModule = buildModule("SimpleLibraryModule", (m) => {
  
  const myLibrary = m.contract("SimpleLibrary");

  return { myLibrary };
});

export default SimpleLibraryModule;
