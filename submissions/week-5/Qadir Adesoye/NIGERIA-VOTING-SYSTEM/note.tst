i use this to run some stuff

ACCOUNT_PRIVATE_KEY= private
LISK_SEPOLIA_URL=https://rpc.sepolia-api.lisk.com




npx hardhat test test/VotingSystem.ts
npx hardhat --network lisk_sepolia run scripts/interact.ts
npx hardhat --network lisk_sepolia run scripts/deploy.ts




this the quection
The government of Nigeria contacted you to build a decentralized voting system for the next general elections.

Use Case The Nigerian government seeks a secure, transparent, and tamper-proof voting system where:

Votes are hidden during the election period.
Results are revealed only after voting ends.
No vote manipulation or duplicate voting is possible.
Immutable records are stored on the blockchain.
Note: implement test and automated scripting to verify the product functionality