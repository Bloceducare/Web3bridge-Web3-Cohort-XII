import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0x414F467601739eD2a10b1BB58020752D2C4a3F53";

// Helper functions
async function getEventContract() {
    return await ethers.getContractAt("EventContract", CONTRACT_ADDRESS);
}

async function getCurrentTime() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
}

async function waitForTransaction(tx, description) {
    console.log(`${description} - Transaction sent, waiting for confirmation...`);
    const receipt = await tx.wait();
    console.log(`${description} - Transaction confirmed! Hash:`, receipt.hash);
    return receipt;
}

async function createEvent() {
    console.log("\n=== Creating Event ===");
    
    const _event = await getEventContract();
    const latestTime = await getCurrentTime();
    
    console.log("Creating event with parameters:", {
        name: "pool party",
        description: "Matured minds only",
        startTime: latestTime + 30,
        endTime: latestTime + 86400,
        price: ethers.parseUnits("0.00000001", 18).toString(),
        maxParticipants: 20
    });
    
    const tx = await _event.createEvent(
        "pool party",
        "Matured minds only",
        latestTime + 30,
        latestTime + 86400,
        ethers.parseUnits("0.00000001", 18),
        1,
        20
    );
    
    const receipt = await waitForTransaction(tx, "Create Event");
    
    const _event_count = await _event.event_count();
    console.log("Total events count:", _event_count.toString());
    
    const _eventInstance = await _event.events(2);
    console.log("Event instance details:", _eventInstance);
    
    return receipt.hash;
}

async function registerEvent() {
    console.log("\n=== Registering for Event ===");
    
    const _event = await getEventContract();
    const owner = await ethers.provider.getSigner();
    console.log("Signer address:", await owner.getAddress());
    
    const tx = await _event.registerForEvent(1, {
        value: ethers.parseUnits("0.00000001", 18)
    });
    
    const receipt = await waitForTransaction(tx, "Register Event");
    
    const _hasRegistered = await _event.getHasRegistered(1, await owner.getAddress());
    console.log("Registration status:", _hasRegistered);
    
    return receipt.hash;
}

async function verifyTicket() {
    console.log("\n=== Verifying Ticket ===");
    
    const _event = await getEventContract();
    const owner = await ethers.provider.getSigner();
    console.log("Signer address:", await owner.getAddress());
    
    const tx = await _event.verifyAttendance(1, 1);
    const receipt = await waitForTransaction(tx, "Verify Ticket");
    
    const isVerified = await _event.isVerifiedTicket(1, 1);
    console.log("Ticket verification status:", isVerified);
    
    return receipt.hash;
}

async function withdrawEvent() {
    console.log("\n=== Withdrawing Event Funds ===");
    
    const _event = await getEventContract();
    
    let _balance = await _event.eventBalance(1);
    console.log("Initial event balance:", ethers.formatEther(_balance), "ETH");
    
    const tx = await _event.withdrawForEvent(1);
    const receipt = await waitForTransaction(tx, "Withdraw Event");
    
    _balance = await _event.eventBalance(1);
    console.log("Final event balance:", ethers.formatEther(_balance), "ETH");
    
    return receipt.hash;
}

// Main function to execute all operations in sequence
async function main() {
    try {
        console.log("Starting event management sequence...");
        
       
        const createHash = await createEvent();
        console.log("Create Event Transaction Hash:", createHash);
        
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    
        const registerHash = await registerEvent();
        console.log("Register Event Transaction Hash:", registerHash);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
   
        const verifyHash = await verifyTicket();
        console.log("Verify Ticket Transaction Hash:", verifyHash);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
       
        const withdrawHash = await withdrawEvent();
        console.log("Withdraw Event Transaction Hash:", withdrawHash);
        
        console.log("\nAll operations completed successfully!");
        
    } catch (error) {
        console.error("Error in execution:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });