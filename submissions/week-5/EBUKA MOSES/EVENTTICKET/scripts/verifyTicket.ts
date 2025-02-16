import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0xF8fbAFAEd2eD40DDC497443B7912c965c8A58b66");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})