import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("YarreToken", (m) => {
  const contract = m.contract("YarreToken", [1000, 1]);

  return { contract };
});
