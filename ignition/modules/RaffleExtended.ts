import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RaffleExtended", (m) => {
  const raffle = m.contract("RaffleExtended", []);

  return { raffle };
});
