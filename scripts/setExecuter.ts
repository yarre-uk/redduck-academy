import { ethers } from "hardhat";

import { abi } from "../artifacts/contracts/Governance/GovernanceExtended.sol/GovernanceExtended.json";

const contractAddress = "0x69cFf00a24876fd06cF7879869ba2bC414082273";

async function main() {
  const [owner] = await ethers.getSigners();

  const contract = new ethers.Contract(contractAddress, abi, owner);

  await contract.grantRoleExecuter(
    "0x65A9618ADEADF6664BD81B846f57324EFE0be234",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
