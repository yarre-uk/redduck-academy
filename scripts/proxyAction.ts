import { ethers } from "hardhat";

import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0x029eA2C522E88A82FDeb881D9cd3576c30eC3F38";

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);

  const proxyContract = new ethers.Contract(proxyAddress, raffleAbi, wallet);

  const weth = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const approvedTokens: `0x${string}`[] = [weth, link];

  const uniswapRouter = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

  const subscriptionId =
    1230560835588391700105489398649300104699330861740292705239295065739960848769n;

  const keyHash =
    "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  const vrfCoordinator = "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b";

  await proxyContract.initialize(
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
