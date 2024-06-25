import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Raffle", (m) => {
  const raffle = m.contract("RaffleExtended", []);

  return { raffle };
});
