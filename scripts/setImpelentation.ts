import { ethers } from "hardhat";

import { abi as proxyAbi } from "../artifacts/contracts/Raffle/MyProxy.sol/MyProxy.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0x8aB7633cb0eE890Be63Ef431c59fe56F67851337";
const raffleAddress = "0xEABAb27977ba8A7Fe7d1A437bbc0EE782bdC776cs";

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);

  const proxyContract = new ethers.Contract(proxyAddress, proxyAbi, wallet);

  console.log(1);

  await proxyContract.setImplementation(raffleAddress);

  console.log(2);

  console.log("impl -> ", await proxyContract.getImplementation());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
