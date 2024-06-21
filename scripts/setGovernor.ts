import { ethers } from "hardhat";

import { abi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";

const contractAddress = "0x255Faf8685006BBD6E87F385F484e68A1E6de2Db";

async function main() {
  const [owner] = await ethers.getSigners();

  const contract = new ethers.Contract(contractAddress, abi, owner);

  await contract.setGovernor("0x69cFf00a24876fd06cF7879869ba2bC414082273");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
