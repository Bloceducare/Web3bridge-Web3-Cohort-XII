import {ethers} from "hardhat";



async function registerEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x3E3A1f9C11036F59a5097e5410e93e18A6BfeeCa");
    const owner = await ethers.provider.getSigner()
    const block = await ethers.provider.getBlock("latest");
    const time = block.timestamp;
    const latestTime = await time;
    const receipt = await _event.registerForEvent(1, {value:ethers.parseUnits("0.00000001", 18)})
    const _hasRegistered = await _event.getHasRegistered(1, owner.address);
    
    console.log("RECEIPT", receipt)
    console.log("REGISTERED", _hasRegistered)

} 


registerEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})