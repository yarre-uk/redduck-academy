import { ethers } from "hardhat";

import { abi as tokenAbi } from "../artifacts/contracts/Governance/GovernanceToken.sol/GovernanceToken.json";

const tokenAddress = "0xFc69dDa9f2b09beFEfd5F5061c51ee164F42881A";

async function main() {
  const first = await ethers.getSigner(
    "0x8A2d5f4739e9932380F750f1d3C2CdCf497Fc5d0",
  );
  const second = await ethers.getSigner(
    "0x5c04b730b881f784FCFA1E84Eea34a73d6219B10",
  );
  const third = await ethers.getSigner(
    "0x65A9618ADEADF6664BD81B846f57324EFE0be234",
  );

  const token1 = new ethers.Contract(tokenAddress, tokenAbi, first);
  const token2 = new ethers.Contract(tokenAddress, tokenAbi, second);
  const token3 = new ethers.Contract(tokenAddress, tokenAbi, third);

  console.log(await token1.getPastVotes(first.address, 6135106n + 100n));
  console.log(await token2.getPastVotes(second.address, 6135106n + 100n));
  console.log(await token3.getPastVotes(third.address, 6135106n + 100n));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
