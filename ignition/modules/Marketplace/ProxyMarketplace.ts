import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import Marketplace from "./Marketplace";

export default buildModule("ProxyMarketplace", (m) => {
  const _proxy = m.contract("MyProxy");
  const weth = m.contract("WETH");
  const nft = m.contract("MyERC721");

  const { marketplace } = m.useModule(Marketplace);

  m.call(_proxy, "setImplementation", [marketplace]);

  const proxyMarketplace = m.contractAt("Marketplace", _proxy, {
    id: "Marketplace___FinalProxy",
  });

  m.call(proxyMarketplace, "initialize", [weth, nft]);

  return { weth, nft, proxyMarketplace };
});
