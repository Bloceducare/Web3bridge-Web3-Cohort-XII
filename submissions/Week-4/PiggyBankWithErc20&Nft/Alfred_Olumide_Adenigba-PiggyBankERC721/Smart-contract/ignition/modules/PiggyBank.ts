import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankModule = buildModule("PiggyBankModule", (m) => {
    // Your ERC20 token address
    const tokenAddress = "0x72adE6a1780220074Fd19870210706AbCb7589BF";
    
    // The NFT contract address 
    const nftAddress = "0xb5497CB80F237435797e6B7Be4245b5Dae25703e"; 
    
    // PiggyBank parameters
    const targetAmount = m.getParameter("targetAmount", "5000000000000000000"); // 5 tokens in wei
    const withdrawalDate = m.getParameter(
        "withdrawalDate", 
        Math.floor(Date.now()/1000) + 172800 // 2 days from now
    );
    // const manager = m.getParameter("manager", "0x1868EAEd088f0B65363960928296D119b62c3184"); //  default manager address
    const manager = m.getAccount(0); // The first account deploying the contract
    
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
