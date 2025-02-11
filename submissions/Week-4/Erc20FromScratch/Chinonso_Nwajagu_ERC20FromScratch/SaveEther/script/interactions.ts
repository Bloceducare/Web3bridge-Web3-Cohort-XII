import {ethers} from "hardhat";

async function main () {

    const Web3CXITokenAddress = "0x6b9583349C12401c2f3A5823AA6AC1EAbF47553d";
    const Web3CXI = await ethers.getContractAt("ERC20", Web3CXITokenAddress)

    const saveERC20ContractAddress = "0xea5DF19309f381f700cB155ECAE5Ce541eC9BFe3";

    const saveERC20 = await ethers.getContractAt("SaveERC20", saveERC20ContractAddress);

    const approvalAmount = ethers.parseUnits("1000", 18);

    const approvetx = await Web3CXI.approve(saveERC20, approvalAmount);
    approvetx.wait();
    //once the approve tx is initiated is done, if u move to the next line to deposit, you will get an error.
    //So you need to wait for that tx to be mined on the blockchain that the reason for the wait method. When
    //are doing real interaction you have to use wait bcos you are interacting with the blockchain itself
   

    const contractBalanceBeforeDeposit = await saveERC20.getContractBalance();
    console.log("contract balance before :::", contractBalanceBeforeDeposit)
    

    

    const depositAmount = ethers.parseUnits("150", 18);
    const depositTx = await saveERC20.deposit(depositAmount);
    // console.log(depositTx)
    depositTx.wait();

    const contractBalanceAfterDeposit = await saveERC20.getContractBalance();

    console.log("contract balance after :::", contractBalanceAfterDeposit)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});