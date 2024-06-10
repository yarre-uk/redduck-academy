import { ethers } from "hardhat";

import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0x8aB7633cb0eE890Be63Ef431c59fe56F67851337";

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
