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
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";

  const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";

  m.call(proxy, "initialize", [
    approvedTokens,
    uniswapRouter,
    subscriptionId,
    keyHash,
    vrfCoordinator,
  ]);

  return { proxy, raffle };
});
