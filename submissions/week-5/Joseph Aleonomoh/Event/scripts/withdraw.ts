import {ethers} from "hardhat";



async function withdrawEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x3E3A1f9C11036F59a5097e5410e93e18A6BfeeCa");

    let _balance = await _event.eventBalance(1);
    console.log("Balance", _balance)


    const receipt = await _event.withdrawForEvent(1)
    _balance = await _event.eventBalance(1);
    

    console.log("Balance", _balance)

} 


withdrawEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})