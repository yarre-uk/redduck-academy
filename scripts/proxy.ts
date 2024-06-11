import { ethers } from "hardhat";

import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0xEABAb27977ba8A7Fe7d1A437bbc0EE782bdC776c";

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);

  const proxyContract = new ethers.Contract(proxyAddress, raffleAbi, wallet);

  console.log("pool ->", await proxyContract.pool());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
