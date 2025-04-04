// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TicketModule = buildModule("TicketModule", (m) => {

  const ticket = m.contract("Ticket", ["name", "symbol"]);

  return { ticket };
});

export default TicketModule;
