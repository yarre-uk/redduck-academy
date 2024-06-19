import { ethers } from "hardhat";

import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { abi as proxyAbi } from "../artifacts/contracts/utils/MyProxy.sol/MyProxy.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0xEABAb27977ba8A7Fe7d1A437bbc0EE782bdC776c";
const raffleAddress = "0xe2B5d1d0e33D71E745a2151e496cddEfFE38416e";

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);

  const proxyContract = new ethers.Contract(proxyAddress, proxyAbi, wallet);

  console.log(1);

  await proxyContract.setImplementation(raffleAddress);

  console.log(2);

  console.log("impl -> ", await proxyContract.getImplementation());

  console.log(2.5);

  const raffleContract = new ethers.Contract(proxyAddress, raffleAbi, wallet);

  console.log(3);

  const weth = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const approvedTokens: `0x${string}`[] = [weth, link];

  const uniswapRouter = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

  const subscriptionId =
    1230560835588391700105489398649300104699330861740292705239295065739960848769n;

  const keyHash =
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";

  const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";

  console.log(4);

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
