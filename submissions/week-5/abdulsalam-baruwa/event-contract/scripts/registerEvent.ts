import {ethers} from "hardhat";



async function registerEvent() {
    const _event = await ethers.getContractAt("EventContract", "0x3025871197Ca0b51c45FC96870509Bf483A006f5");
    const owner = await ethers.provider.getSigner()
    const block = await ethers.provider.getBlock("latest");
    const time = Date.now();
    const latestTime = await time;
    const receipt = await _event.registerForEvent(2, {value:ethers.parseUnits("0.00000001", 18)})
    const _hasRegistered = await _event.getHasRegistered(2, owner.address);
    

    console.log("REGISTERED", _hasRegistered)

} 


registerEvent().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})