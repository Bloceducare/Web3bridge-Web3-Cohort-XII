# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```


XiTK Token deployed at: 0x48118f711a06a3C93A54A04Bcde10A48e51C5C67

XiAirdrop contract deployed at: 0x77DAFD1e598847c6a984Ef79B7F92C33E5384Cc5


Merkle Root: 0x7e519ea6ab4891ddff470d5b23f1d341c228eb05372af035fb95b11e9d2922ac


npx hardhat run scripts/updateMerkleRoot.ts --network base . npx hardhat run scripts/claimAirdrop.ts --network base  

node generateMerkleRoot.js

merkle proof:s
Proof for 0xAbCdEf1234567890aBcDEf1234567890aBcDEf12: [ 'b01d585c7603a95fe78c3adc3e28dbf081b4a0c12475436d8c9ac16d7be95488' ]
Proof for 0x9876543210FEDCBA9876543210FEDCBA98765432: [ 'f1f593a519d3b1ca8b8f838a967a2417e112e340c67d6b94239636f05c72b0ad' ]
