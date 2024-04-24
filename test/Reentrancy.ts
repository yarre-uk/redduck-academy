import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  Attacker__factory,
  AttackerAll__factory,
  Reentrancy__factory,
} from "../typechain-types";

describe("Reentrancy", async () => {
  async function deploy() {
    const [owner, account1] = await ethers.getSigners();

    const contract = await new Reentrancy__factory(owner).deploy();
    const attacker = await new Attacker__factory(account1).deploy(
      contract.getAddress(),
    );
    const attackerAll = await new AttackerAll__factory(account1).deploy(
      contract.getAddress(),
    );

    return {
      contract,
      attacker,
      attackerAll,
      owner,
      account1,
    };
  }

  describe("Attack", async () => {
    //   it("should be able to attack", async () => {
    //     const { contract, attacker } = await loadFixture(deploy);
    //     await contract.deposit({ value: 100 });
    //     await attacker.deposit({ value: 100 });
    //     console.log(await ethers.provider.getBalance(contract.getAddress()));
    //     console.log(await ethers.provider.getBalance(attacker.getAddress()));
    //     // expect(
    //     //   await ethers.provider.getBalance(contract.getAddress()),
    //     //   "Contract balance should be 20",
    //     // ).to.be.equal(20n);
    //     await attacker.attack(5);
    //     // expect(
    //     //   await ethers.provider.getBalance(contract.getAddress()),
    //     //   "Contract balance should be less than 19",
    //     // ).to.lessThanOrEqual(18n);
    //     // expect(
    //     //   await ethers.provider.getBalance(attacker.getAddress()),
    //     //   "Attacker balance should more that 2",
    //     // ).to.greaterThanOrEqual(2n);
    //     console.log(await ethers.provider.getBalance(contract.getAddress()));
    //     console.log(await ethers.provider.getBalance(attacker.getAddress()));
    //     console.log(await contract.balances(attacker.getAddress()));
    //   });

    it("should be able to attack with all", async () => {
      const { contract, attackerAll } = await loadFixture(deploy);
      await contract.deposit({ value: 10 });
      await attackerAll.deposit({ value: 1 });
      expect(
        await ethers.provider.getBalance(contract.getAddress()),
        "Contract balance should be 11",
      ).to.be.equal(11n);
      await attackerAll.attack();
      expect(
        await ethers.provider.getBalance(contract.getAddress()),
        "Contract balance should be 0",
      ).to.be.equal(0n);
      expect(
        await ethers.provider.getBalance(attackerAll.getAddress()),
        "Attacker balance should be 20",
      ).to.be.equal(11n);
    });
  });
});
