import { ethers } from "hardhat";
import { Contract } from "ethers";

const CONTRACT_ADDRESS = "0x983C16E6D469723D7EFC1d4650e6472c38b7d212";

async function main() {
  const [deployer, user] = await ethers.getSigners();
  // Define contract instance type explicitly

  const CONTRACT_ADDRESS = "0x77Fc36648D23c64bF665119C502F4772755b70e2";
  const EVENT_CONTRACT_ABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "_eventId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "_attendee",
          type: "address",
        },
      ],
      name: "AttendanceConfirmed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "_organizer",
          type: "address",
        },
      ],
      name: "EventCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "_eventId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "_buyer",
          type: "address",
        },
      ],
      name: "TicketPurchased",
      type: "event",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_eventId", type: "uint256" },
        { internalType: "address", name: "_attendee", type: "address" },
      ],
      name: "confirmAttendance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "_title", type: "string" },
        { internalType: "string", name: "_desc", type: "string" },
        { internalType: "uint256", name: "_startDate", type: "uint256" },
        { internalType: "uint256", name: "_endDate", type: "uint256" },
        { internalType: "uint8", name: "_type", type: "uint8" },
        { internalType: "uint32", name: "_egc", type: "uint32" },
        { internalType: "uint256", name: "_ticketPrice", type: "uint256" },
      ],
      name: "createEvent",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_eventId", type: "uint256" }],
      name: "purchaseTicket",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "events",
      outputs: [
        { internalType: "string", name: "_title", type: "string" },
        { internalType: "string", name: "_description", type: "string" },
        { internalType: "uint256", name: "_startDate", type: "uint256" },
        { internalType: "uint256", name: "_endDate", type: "uint256" },
        { internalType: "uint8", name: "_type", type: "uint8" },
        { internalType: "uint32", name: "_expectedGuestCount", type: "uint32" },
        {
          internalType: "uint32",
          name: "_registeredGuestCount",
          type: "uint32",
        },
        { internalType: "uint32", name: "_verifiedGuestCount", type: "uint32" },
        { internalType: "address", name: "_organizer", type: "address" },
        { internalType: "address", name: "_ticketAddress", type: "address" },
        { internalType: "uint256", name: "_ticketPrice", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const eventContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    EVENT_CONTRACT_ABI,
    deployer
  ) as Contract & {
    purchaseTicket: (
      eventId: number,
      overrides?: { value: bigint }
    ) => Promise<any>;
  };

  // Create an event
  async function createEvent() {
    const tx = await eventContract.createEvent(
      "Blockchain Summit",
      "A conference about blockchain",
      Math.floor(Date.now() / 1000) + 3600, // Start date (1 hour from now)
      Math.floor(Date.now() / 1000) + 86400, // End date (24 hours from now)
      1, // EventType: 0 for free, 1 for paid
      100, // Expected guests
      ethers.parseEther("0.05") // Ticket price (for paid events)
    );
    await tx.wait();
    console.log("Event created successfully", tx);
  }

  // Purchase a ticket
  async function purchaseTicket(eventId: number) {
    const tx = await eventContract.purchaseTicket(eventId, {
      value: ethers.parseEther("0.05"), // Ensure this matches the ticket price
    });
    await tx.wait();
    console.log("Ticket purchased successfully");
  }

  // Confirm attendance
  async function confirmAttendance(eventId: number, attendee: string) {
    const tx = await eventContract.confirmAttendance(eventId, attendee);
    await tx.wait();
    console.log("Attendance confirmed");
  }

  // Example usage:
  await createEvent();
  await purchaseTicket(1);
  await confirmAttendance(1, user.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});