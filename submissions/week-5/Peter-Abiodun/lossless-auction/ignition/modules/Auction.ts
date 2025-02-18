// // This setup uses Hardhat Ignition to manage smart contract deployments.
// // Learn more about it at https://hardhat.org/ignition

// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const EventContract = buildModule("EventContract", (m:any) => {
//   const ticketFactoryAddress = m.getParameter("_ticketFactory");
  
//   const event = m.contract("EventContract", [ticketFactoryAddress]);
//   return { event };
// });

// export default EventContract;