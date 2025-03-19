import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DmysticalNFTModule = buildModule("DmysticalNFTModule", (m) => {

  const dmysticalnft = m.contract("DmysticalNFT");

  return { dmysticalnft };
});

export default DmysticalNFTModule;