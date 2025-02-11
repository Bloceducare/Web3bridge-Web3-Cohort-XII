import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x617F2E2fD72FD9D5503197092aC168c91465E7f2"

const SaveERC20Module = buildModule("SaveERC20Module", (m) => {
  

  const save = m.contract("SaveERC20", [tokenAddress]);

  return { save };
});

export default SaveERC20Module;


///0xd034fe052F105250F598cae50495B0573d885AfE
// 0xd034fe052F105250F598cae50495B0573d885AfE


//0xea5DF19309f381f700cB155ECAE5Ce541eC9BFe3