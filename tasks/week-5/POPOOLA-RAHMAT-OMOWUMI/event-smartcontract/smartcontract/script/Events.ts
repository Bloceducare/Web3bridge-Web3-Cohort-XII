import {ethers} from "hardhat";

async function createEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x1c70D30C8169C1c330a5a2A91a4a2B802ff14345");
    console.log(_event);
    const block = await ethers.provider.getBlock("latest");
    const time = block.timestamp;
    const latestTime = await time;
    const receipt = await _event.createEvent("pool party", "Matured minds only", latestTime+30, latestTime + 86400, ethers.parseUnits("0.00000001", 18), 1, 20);
    const _event_count = await _event.event_count();
    const _eventInstance = await _event.events(_event_count);

    console.log("RECEIPT", receipt)
    console.log("EVENT INSTANCE", _eventInstance)

} 


createEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})


async function registerEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x1c70D30C8169C1c330a5a2A91a4a2B802ff14345");
    const owner = await ethers.provider.getSigner()
    const block = await ethers.provider.getBlock("latest");
    const time = block.timestamp;
    const latestTime = await time;
    const receipt = await _event.registerForEvent(2, {value:ethers.parseUnits("0.00000001", 18)})
    const _hasRegistered = await _event.getHasRegistered(2, owner.address);
    

    console.log("REGISTERED", _hasRegistered)

} 


registerEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})





async function verifyTicket() {
    const _event = await ethers.getContractAt("EventContract", "0x1c70D30C8169C1c330a5a2A91a4a2B802ff14345");
    const owner = await ethers.provider.getSigner()
    const verify = await _event.verifyAttendance(2, 1);
    const isVerified = await _event.isVerifiedTicket(1, 2);
    

    console.log("VERIFIED", isVerified)


} 


verifyTicket().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})