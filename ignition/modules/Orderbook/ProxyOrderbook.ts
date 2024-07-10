import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import ERC1155 from "./ERC1155";
import Orderbook from "./Orderbook";

export default buildModule("ProxyOrderbook", (m) => {
  const { orderbook } = m.useModule(Orderbook);

  const _proxy = m.contract("MyProxy");
  const { erc1155 } = m.useModule(ERC1155);

  m.call(_proxy, "setImplementation", [orderbook]);

  const proxyOrderbook = m.contractAt("OrderbookExtended", _proxy, {
    id: "OrderbookExtended___FinalProxy",
  });

  m.call(proxyOrderbook, "initialize", [erc1155, [0n]]);

  return { proxyOrderbook };
});
