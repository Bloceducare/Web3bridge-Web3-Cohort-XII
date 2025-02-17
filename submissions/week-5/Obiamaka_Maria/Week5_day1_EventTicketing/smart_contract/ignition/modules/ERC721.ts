import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TicketNFTModule = buildModule("TicketNFTModule", (m) => {

  const name = "Cxii_pool_party";
  const symbol = "CXII";
  const ticketNFT = m.contract("TicketNFT", [name, symbol]);

  return { ticketNFT };
});

export default  TicketNFTModule;