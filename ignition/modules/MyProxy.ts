import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyProxy", (m) => {
  const proxy = m.contract("MyProxy", []);

  return { proxy };
});
