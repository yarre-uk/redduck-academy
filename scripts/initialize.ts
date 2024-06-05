import { ethers } from "hardhat";

import { abi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { PRIVATE_KEY_OWNER } from "../env";

async function main() {
  const provider = ethers.provider;
  const wallet = ethers.Wallet.fromPhrase(PRIVATE_KEY_OWNER).connect(provider);

  const raffleContract = new ethers.Contract(
    "0x8D58396C062586d9c0F42c8b296c3977789F9C9A",
    abi,
    wallet,
  );

  const usdt = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";
  const usdc = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const approvedTokens: `0x${string}`[] = [usdt, usdc, link];

  const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const subscriptionId =
    1230560835588391700105489398649300104699330861740292705239295065739960848769n;

  const keyHash =
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";

  const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";

  await raffleContract.initialize(
    approvedTokens,
    uniswapRouter,
    subscriptionId,
    keyHash,
    vrfCoordinator,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
