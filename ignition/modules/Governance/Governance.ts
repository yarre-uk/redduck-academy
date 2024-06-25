import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Governance", (m) => {
  const governance = m.contract("GovernanceExtended", []);

  return { governance };
});
