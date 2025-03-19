Contract Address = 0x6C69eaBEF45ab271d5712f2E83A3a3406C22394d

CrowdFunding Contract
This project implements a CrowdFunding smart contract built with Solidity and deployed using Hardhat. It allows users to create fundraising campaigns and contribute to them by sending Ether. The contract tracks the amount of funds raised for each campaign and ensures contributions are made only before the campaign deadline.

Key Features
-Campaign Creation: Users can create campaigns by specifying the name, target amount, and deadline.
-Contributions: People can contribute Ether to a campaign as long as it is active (i.e., before the deadline).
-Tracking: The contract keeps track of how much each campaign has raised, as well as individual contributions.
-Verification: After deployment, the contract can be verified on Etherscan.

Report on Implementation
This project demonstrates a simple CrowdFunding contract that enables users to contribute to campaigns. Here's an explanation of how key Solidity concepts were used in this implementation:

1. Structs:
To organize the data for each campaign, a struct was used. A struct allows us to group related data together. In this case, each campaign has a name, target amount, amount raised, and a deadline. Using a struct simplifies the management of these different pieces of information.

2. Mappings:
Mappings were used to store and retrieve data efficiently. One mapping keeps track of all the campaigns by their unique ID, while another records individual contributions. This allows users to query the amount raised for each campaign and the contributions made by specific addresses.

3. Modifiers:
A modifier was implemented to enforce rules on functions. For example, a modifier checks if the deadline for a campaign has passed before allowing a user to contribute. This helps to ensure the logic remains clean and reusable across multiple functions.

4. Payable Functions:
The contribute function is marked as payable, meaning it can accept Ether when called. This allows users to send Ether to contribute to the campaigns. The function ensures that contributions are only accepted if they are greater than zero and if the campaign is still active.

5. Constructor:
The contract’s constructor initializes the contract by setting the deployer’s address as the owner. This makes the owner the only one with permission to create new campaigns, adding an extra layer of security.

6. Hardhat:
Hardhat was used as the development environment to compile, deploy, and test the contract. Hardhat makes it easy to set up different networks (like Sepolia), manage deployments, and verify contracts on Etherscan.

7. Deployment and Verification:
Once the contract is developed and tested, it is deployed to the Sepolia test network. After deployment, we can verify the contract on Etherscan so others can interact with it directly from the blockchain explorer.

8. Ethereum Interactions:
The contract works on the Ethereum network, allowing users to send Ether to the contract and contribute to various campaigns. This introduces the concept of decentralized applications (dApps), where users can engage in crowdfunding activities in a trustless environment.

