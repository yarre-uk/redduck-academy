import { ethers } from "hardhat";

import { abi as tokenAbi } from "../artifacts/contracts/Governance/GovernanceToken.sol/GovernanceToken.json";

const tokenAddress = "0xC20f1D53b269B9F8be1d6B582a727D14b2D0d8bD";

async function main() {
  const [wallet1, wallet2, wallet3] = await ethers.getSigners();

  const token1 = new ethers.Contract(tokenAddress, tokenAbi, wallet1);
  const token2 = new ethers.Contract(tokenAddress, tokenAbi, wallet2);
  const token3 = new ethers.Contract(tokenAddress, tokenAbi, wallet3);

  await token1.mint(wallet1.address, 1000000);
  await token1.mint(wallet2.address, 1000000);
  await token1.mint(wallet3.address, 1000000);

  console.log(
    "Token 1 balance: ",
    (await token1.balanceOf(wallet1.address)).toString(),
  );
  console.log(
    "Token 2 balance: ",
    (await token1.balanceOf(wallet2.address)).toString(),
  );
  console.log(
    "Token 3 balance: ",
    (await token1.balanceOf(wallet3.address)).toString(),
  );

  await token1.delegate(wallet2.address);
  await token2.delegate(wallet3.address);
  await token3.delegate(wallet1.address);

  await token1.transfer(wallet2.address, 1000);
  await token2.transfer(wallet3.address, 1000);
  await token3.transfer(wallet1.address, 1000);

  console.log(await token1.getVotes(wallet1.address));
  console.log(await token2.getVotes(wallet2.address));
  console.log(await token3.getVotes(wallet3.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
