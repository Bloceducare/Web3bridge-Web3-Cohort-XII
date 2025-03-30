import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x5711B9ea68A3b44Bcf319Fd43d57B8AD45426102");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)
} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})