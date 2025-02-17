const hre = require("hardhat");

async function main() {
    // Define the proposals (convert strings to bytes32)
    const proposalNames = ["Alice", "Bob", "Charlie"].map(name =>
        hre.ethers.encodeBytes32String(name)
    );

    // Get the Contract Factory
    const Ballot = await hre.ethers.getContractFactory("Ballot");

    // Deploy the contract with proposal names
    const ballot = await Ballot.deploy(proposalNames);

    // Wait for deployment to be confirmed
    await ballot.waitForDeployment();

    console.log(`✅ Ballot contract deployed to: ${ballot.target}`);
}

// Run the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
