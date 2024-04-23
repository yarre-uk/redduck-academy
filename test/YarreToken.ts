import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { MyContract__factory } from "../typechain-types";

describe("YarreToken", async () => {
  async function deploy() {
    const [owner, account1] = await ethers.getSigners();

    const value = ethers.parseEther("1000");

    const contract = await new MyContract__factory(owner).deploy(value);

    return {
      contract,
      owner,
      account1,
      value,
    };
  }

  describe("deploy", async () => {
    it("should deploy the contract", async () => {
      await deploy();
    });

    it("should set the owner balance", async () => {
      const { contract, value } = await loadFixture(deploy);

      expect(await contract.value()).to.equal(value);
    });
  });
});
