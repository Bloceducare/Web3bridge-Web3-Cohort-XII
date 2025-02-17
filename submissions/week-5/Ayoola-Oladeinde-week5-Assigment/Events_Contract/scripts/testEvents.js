require('dotenv').config();
const { ethers } = require('ethers');
const contractABI = require('../utils/abi.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.API_KEY);
const wallet = new ethers.Wallet(process.env.SECRET_KEY, provider);

const contractAddress = '0x55Fddf287dfF444310F523B2bdf7B6ddC78a7421';
const eventContractABI = contractABI;

const eventContract = new ethers.Contract(
  contractAddress,
  eventContractABI,
  wallet
);

const testEventFlow = async () => {
  try {
    console.log('\n🛠️ Creating a free event...');
    const createEventTx = await eventContract.createEvent(
      'Web3 Summit',
      'The biggest blockchain event',
      Math.floor(Date.now() / 1000) + 3600, // Start in 1 hour
      Math.floor(Date.now() / 1000) + 86400, // Ends in 1 day
      0, // Free event
      0, // No price
      100 // Expected guests
    );

    const eventReceipt = await createEventTx.wait();
    const eventId = eventReceipt.logs[0].args.eventId;
    console.log(`✅ Free Event Created! ID: ${eventId.toString()}`);

    console.log('\n🛠️ Creating tickets for the event...');
    const createTicketTx = await eventContract.createEventTicket(
      eventId,
      'Web3Ticket',
      'W3T'
    );
    await createTicketTx.wait();
    console.log('✅ Tickets created successfully!');

    console.log('\n🛠️ Registering for the free event...');
    const registerTx = await eventContract.registerForEvent(eventId);
    await registerTx.wait();
    console.log('✅ Successfully registered for the free event!');

    console.log('\n📊 Fetching registered guest count...');
    const guestCount = await eventContract.getRegisteredGuestCount(eventId);
    console.log(`✅ Total Registered Guests: ${guestCount.toString()}`);

    console.log('\n🛠️ Creating a paid event...');
    const createPaidEventTx = await eventContract.createEvent(
      'Blockchain Masterclass',
      'Deep dive into smart contracts',
      Math.floor(Date.now() / 1000) + 7200, // Start in 2 hours
      Math.floor(Date.now() / 1000) + 90000, // Ends in 1 day + 1 hour
      1, // Paid event
      ethers.parseEther('0.0001'), // 0.01 ETH ticket price
      50 // Expected guests
    );

    const paidEventReceipt = await createPaidEventTx.wait();
    const paidEventId = paidEventReceipt.logs[0].args.eventId;
    console.log(`✅ Paid Event Created! ID: ${paidEventId.toString()}`);

    console.log('\n🛠️ Creating tickets for the paid event...');
    const createPaidTicketTx = await eventContract.createEventTicket(
      paidEventId,
      'MasterclassTicket',
      'MCT'
    );
    await createPaidTicketTx.wait();
    console.log('✅ Tickets created successfully!');

    console.log('\n🛠️ Registering for the paid event...');
    const registerPaidTx = await eventContract.registerForEvent(paidEventId, {
      value: ethers.parseEther('0.0001'),
    });
    await registerPaidTx.wait();
    console.log('✅ Successfully registered for the paid event!');

    console.log('\n📊 Fetching registered guest count for paid event...');
    const paidGuestCount = await eventContract.getRegisteredGuestCount(
      paidEventId
    );
    console.log(
      `✅ Total Registered Guests for Paid Event: ${paidGuestCount.toString()}`
    );
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testEventFlow();
