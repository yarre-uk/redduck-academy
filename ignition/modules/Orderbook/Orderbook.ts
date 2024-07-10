import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("OrderbookExtended", (m) => {
  const orderbook = m.contract("OrderbookExtended", []);

  return { orderbook };
});
