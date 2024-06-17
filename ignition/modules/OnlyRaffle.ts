import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("OnlyRaffle", (m) => {
  const raffle = m.contract("RaffleExtended", []);

  return { raffle };
});
