import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import RaffleExtended from "./RaffleExtended";

export default buildModule("MyProxy", (m) => {
  const { raffle } = m.useModule(RaffleExtended);

  const proxy = m.contract("MyProxy", []);

  return { proxy, raffle };
});
