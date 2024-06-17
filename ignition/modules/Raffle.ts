import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyProxy", (m) => {
  const _proxy = m.contract("MyProxy", []);
  const raffle = m.contract("RaffleExtended", []);

  m.call(_proxy, "setImplementation", [raffle]);

  const proxy = m.contractAt("RaffleExtended", _proxy, {
    id: "MyProxyUpdated",
  });

  const weth = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const approvedTokens: `0x${string}`[] = [weth, link];

  const uniswapRouter = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

  const subscriptionId =
    1230560835588391700105489398649300104699330861740292705239295065739960848769n;

  const keyHash =
    "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  const vrfCoordinator = "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b";

  m.call(proxy, "initialize", [
    approvedTokens,
    uniswapRouter,
    subscriptionId,
    keyHash,
    vrfCoordinator,
  ]);

  return { proxy, raffle };
});
