// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./MultiSigWallet.sol";  

contract BoardFundManagerFactory {
    event FundManagerDeployed(address indexed newFund, address indexed token, address[] boardMembers);

    address[] public deployedFunds;

    function createFundManager(address[] memory _members, address _token) external {
        BoardFundManager newFund = new BoardFundManager(_members, _token);
        deployedFunds.push(address(newFund));
        emit FundManagerDeployed(address(newFund), _token, _members);
    }

    function getDeployedFunds() external view returns (address[] memory) {
        return deployedFunds;
    }
}

//npx hardhat run scripts/deployFactory.ts --network base_sepolia
//npx hardhat run scripts/deployFund.ts --network base_sepolia
//npx hardhat run scripts/checkBalance.ts --network base_sepolia
//npx hardhat run scripts/depositFunds.ts --network base_sepolia
//npx hardhat run scripts/submitTransaction.ts --network base_sepolia
//npx hardhat run scripts/approveTransaction.ts --network base_sepolia
//npx hardhat run scripts/getApprovalStatus.ts --network base_sepolia
//npx hardhat run scripts/executeTransaction.ts --network base_sepolia
//npx hardhat run scripts/getTransactions.ts --network base_sepolia
//npx hardhat run scripts/automate.ts --network base_sepolia
