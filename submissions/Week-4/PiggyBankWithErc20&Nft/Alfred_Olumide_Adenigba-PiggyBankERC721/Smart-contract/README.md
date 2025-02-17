# PiggyBank Smart Contract

## Overview
PiggyBank is a smart contract designed to facilitate savings through ERC20 tokens and incentivize contributors with NFTs. The contract allows users to save tokens until a predefined withdrawal date, after which the manager can withdraw the funds.

This setup utilizes Hardhat for smart contract development, testing, and deployment, with **Hardhat Ignition** used for streamlined contract deployment.

## Features
- **ERC20 Token Support**: Users can deposit an ERC20 token into the PiggyBank contract.
- **NFT Minting**: Contributors receive an NFT upon meeting certain conditions.
- **Time-Locked Withdrawals**: The contract enforces a withdrawal date to ensure funds remain locked until maturity.
- **Manager-Only Withdrawal**: Only the contract manager can withdraw funds after the target amount is met and the withdrawal date has passed.

## Tech Stack
- Solidity (0.8.28)
- Hardhat
- Hardhat Ignition (for deployment management)
- Hardhat / Chai (for testing)
- TypeScript

## Deployment

### Prerequisites
Ensure you have the following installed:
- Node.js
- Hardhat
- dotenv (for environment variables management)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/7maylord/piggybank-ERC721.git
   cd piggybank-ERC721
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   ALCHEMY_BASE_SEPOLIA_API_KEY_URL=<your-alchemy-url>
   ACCOUNT_PRIVATE_KEY=<your-private-key>
   ```

### Deploying the Contracts

#### Deploy PiggyBank Token
```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MayTokenModule = buildModule("MayTokenModule", (m) => {
  // Define constructor arguments
  const name = "MayToken";
  const symbol = "MTK";
  const initialSupply = 10; // 1 million tokens
  const owner = m.getAccount(0); // The first account deploying the contract

  const maytoken = m.contract("MayToken", [name, symbol, initialSupply, owner]);

  return { maytoken };
});

export default MayTokenModule;
```
Run the following command to deploy the Token contract:
```bash
npx hardhat ignition deploy ignition/modules/PiggyBank-ERC20.ts --network base_sepolia
```
#### Deploy PiggyBankNFT
```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankNFTModule = buildModule("PiggyBankNFTModule", (m) => {
  const name = "MAY NFT CONTRACT";
  const symbol = "MTK-NFT";
  const nft = m.contract("PiggyBankNFT", [name, symbol]);

  return { nft };
});

export default PiggyBankNFTModule;
```
Run the following command to deploy the NFT contract:
```bash
npx hardhat ignition deploy ignition/modules/PiggyBank-ERC721.ts --network base_sepolia
```

#### Deploy PiggyBank Contract
```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankModule = buildModule("PiggyBankModule", (m) => {
    const tokenAddress = "0x72adE6a1780220074Fd19870210706AbCb7589BF"; //Your ERC20 Token Address
    const nftAddress = "0xb5497CB80F237435797e6B7Be4245b5Dae25703e"; // Your ERC721 NFT Address
    const targetAmount = m.getParameter("targetAmount", "5000000000000000000"); // 5 tokens in wei
    const withdrawalDate = m.getParameter("withdrawalDate", Math.floor(Date.now()/1000) + 172800);
    const manager = m.getAccount(0);

    const piggyBank = m.contract("PiggyBank", [
        targetAmount,
        withdrawalDate,
        manager,
        tokenAddress,
        nftAddress
    ]);

    return { piggyBank };
});

export default PiggyBankModule;
```
Run the following command to deploy the PiggyBank contract:
```bash
npx hardhat ignition deploy PiggyBank.ts --network base_sepolia
```

## Testing

The test suite is built using Hardhat and Chai. To run tests, execute:
```bash
npx hardhat test ./test/PiggyBank.ts
```

### Example Test Case
```ts
describe("Deployment", () => {
  it("Should deploy piggybank correctly", async () => {
    const { deployPiggyBank, manager } = await loadFixture(deployPiggyBankContract);
    expect(await deployPiggyBank.manager()).to.equal(manager.address);
  });
});
```

## License
This project is unlicensed.

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀