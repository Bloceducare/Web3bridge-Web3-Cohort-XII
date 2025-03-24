import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiSigModule = buildModule("MultisigModule", (m) => {
  const validSigners = [
    "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
  ];
  const quorum = 2;

  const multiSig = m.contract("MultiSig", [validSigners, quorum]);

  return { multiSig };
});

export default MultiSigModule;
