// Thhis script interacts with the verifyTicket function

import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x48D3936463F1dD60406C234438075618f831dA65");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})