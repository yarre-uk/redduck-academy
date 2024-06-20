import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import Governance from "./Governance";
import RaffleProxy from "./ProxyRaffle";

export default buildModule("ProxyGovernance", (m) => {
  const _proxy = m.contract("MyProxy", []);
  const token = m.contract("GovernanceToken", [], {
    id: "Governance___FinalToken",
  });
  const { governance } = m.useModule(Governance);
  const { proxy: proxyRaffle } = m.useModule(RaffleProxy);

  m.call(_proxy, "setImplementation", [governance]);

  const proxyGovernance = m.contractAt("GovernanceExtended", _proxy, {
    id: "Governance___FinalProxy",
  });

  m.call(proxyGovernance, "initialize", [proxyRaffle, token, 100, 100, 100]);

  return { proxyGovernance, proxyRaffle, token };
});
