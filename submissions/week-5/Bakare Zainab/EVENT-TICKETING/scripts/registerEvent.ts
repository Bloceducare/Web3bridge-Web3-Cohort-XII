import {ethers} from "hardhat";



async function registerEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x0fa9f34aE0958495040a95bf9d857faD5E2B3419");
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