import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x3E3A1f9C11036F59a5097e5410e93e18A6BfeeCa");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(1, 1);
    const isVerified = await _event.isVerifiedTicket(1, 1);
    
    console.log("RECEIPT", verify)
    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})