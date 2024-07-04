import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import ERC721 from "./ERC721";
import Marketplace from "./Marketplace";
import WETH from "./WETH";

export default buildModule("ProxyMarketplace", (m) => {
  const _proxy = m.contract("MyProxy");
  const { weth } = m.useModule(WETH);
  const { erc721 } = m.useModule(ERC721);

  const { marketplace } = m.useModule(Marketplace);

  m.call(_proxy, "setImplementation", [marketplace]);

  const proxyMarketplace = m.contractAt("MarketplaceExtended", _proxy, {
    id: "Marketplace___FinalProxy",
  });

  m.call(proxyMarketplace, "initialize", [erc721, weth]);

  return { proxyMarketplace };
});
