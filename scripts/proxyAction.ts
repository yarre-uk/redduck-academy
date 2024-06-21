import { ethers } from "hardhat";

import { abi } from "../artifacts/contracts/Governance/GovernanceExtended.sol/GovernanceExtended.json";
import { PRIVATE_KEY } from "../env";

const proxyAddress = "0x8af124Ff30817DF3313Fdb9c89B3f06664bDd839";

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);

  const proxyContract = new ethers.Contract(proxyAddress, abi, wallet);

  const asd = await proxyContract.getProposal(
    "0x34ae38405c690f1b7226b19ae4b2665a41e31bede507d1eafa85fed7d3dee627",
  );

  console.log("asd ->", asd);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
