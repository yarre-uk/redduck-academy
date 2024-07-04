import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyProxy", (m) => {
  const raffle = m.contract("MyProxy", []);

  return { raffle };
});
