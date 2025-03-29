import {ethers} from "hardhat";



async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x3025871197Ca0b51c45FC96870509Bf483A006f5");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})