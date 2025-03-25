// This script interacts with the createEvent function

import {ethers} from "hardhat";



async function createEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x48D3936463F1dD60406C234438075618f831dA65");
    console.log(_event);
    const block = await ethers.provider.getBlock("latest");
    const time = block.timestamp;
    const latestTime = await time;
    const receipt = await _event.createEvent("Enhance Podcast", "Mental_health_podcast", latestTime+30, latestTime + 86400, ethers.parseUnits("0.00000001", 18), 1, 20);
    const _event_count = await _event.event_count();
    const _eventInstance = await _event.events(_event_count);

    console.log("RECEIPT", receipt)
    console.log("EVENT INSTANCE", _eventInstance)
    console.log(_eventInstance.)


} 


createEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})