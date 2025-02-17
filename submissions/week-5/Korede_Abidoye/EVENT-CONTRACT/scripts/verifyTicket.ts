import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x730786b9f7b09cbf61e8d29F209254347b1C684c");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})