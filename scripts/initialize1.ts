import { ethers } from "hardhat";

import { abi as proxyAbi } from "../artifacts/contracts/Raffle/MyProxy.sol/MyProxy.json";
import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0x8aB7633cb0eE890Be63Ef431c59fe56F67851337";
const raffleAddress = "0xFef81C282D24b731F7c5858C368f6B48FbFfAc9C";

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

  const uniswapRouter = "0x425141165d3DE9FEC831896C016617a52363b687";

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
