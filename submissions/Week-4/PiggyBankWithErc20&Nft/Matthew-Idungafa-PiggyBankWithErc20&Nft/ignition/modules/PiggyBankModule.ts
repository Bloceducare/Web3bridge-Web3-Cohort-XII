// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const PiggyBankModule = buildModule("PiggyBankModule", (m) => {
//     // Your existing ERC20 token address
//     const tokenAddress = "0xcde04203314146d133389e7abb29311df156f683";
    
//     // The NFT contract address you got from the previous deployment
//     const nftAddress = 0x824605DF110C7ee25cBa398e69A55D2E856d1D5B; // Replace with actual address
    
//     // PiggyBank parameters
//     const targetAmount = m.getParameter("targetAmount", "5000000000000000000"); // 5 tokens in wei
//     const withdrawalDate = m.getParameter(
//         "withdrawalDate", 
//         Math.floor(Date.now()/1000) + 172800 // 2 days from now
//     );
//     const manager = m.getParameter("manager"); // Contract deployer as manager
    
//     const piggyBank = m.contract("OurPiggyBank", [
//         targetAmount,
//         withdrawalDate,
//         manager,
//         tokenAddress,
//         nftAddress
//     ]);

//     return { piggyBank };
// });

// export default PiggyBankModule;



import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankModule = buildModule("PiggyBankModule", (m) => {
    // Your existing ERC20 token address
    const tokenAddress = "0xcde04203314146d133389e7abb29311df156f683";
    
    // The NFT contract address you got from the previous deployment
    const nftAddress = "0x824605DF110C7ee25cBa398e69A55D2E856d1D5B"; 
    
    // PiggyBank parameters
    const targetAmount = m.getParameter("targetAmount", "5000000000000000000"); // 5 tokens in wei
    const withdrawalDate = m.getParameter(
        "withdrawalDate", 
        Math.floor(Date.now()/1000) + 172800 // 2 days from now
    );
    const manager = m.getParameter("manager", "0x1868EAEd088f0B65363960928296D119b62c3184"); //  default manager address
    
    const piggyBank = m.contract("OurPiggyBank", [
        targetAmount,
        withdrawalDate,
        manager,
        tokenAddress,
        nftAddress
    ]);

    return { piggyBank };
});

export default PiggyBankModule;