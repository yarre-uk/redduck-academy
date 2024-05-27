import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("Raffle", (m) => {
  const value = ethers.parseEther("1000");

  const contract = m.contract("Raffle", []);

  return { contract };
});
