import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Marketplace", (m) => {
  const marketplace = m.contract("MarketplaceExtended", []);

  return { marketplace };
});
