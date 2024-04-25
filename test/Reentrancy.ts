import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Attacker__factory, Reentrancy__factory } from "../typechain-types";

describe("Reentrancy", async () => {
  async function deploy() {
    const [owner, account1] = await ethers.getSigners();

    const contract = await new Reentrancy__factory(owner).deploy();
    const attacker = await new Attacker__factory(account1).deploy(
      contract.getAddress(),
    );

    return {
      contract,
      attacker,
      owner,
      account1,
    };
  }

  it("should fail to attack", async () => {
    const { contract, attacker } = await loadFixture(deploy);

    await contract.deposit({ value: 10 });
    await attacker.deposit({ value: 1 });

    expect(
      await ethers.provider.getBalance(contract.getAddress()),
      "Contract balance should be 11",
    ).to.be.equal(11n);

    await attacker.attack();

    expect(
      await ethers.provider.getBalance(contract.getAddress()),
      "Contract balance should be 11",
    ).to.be.equal(11n);

    expect(
      await ethers.provider.getBalance(attacker.getAddress()),
      "Attacker balance should be 0",
    ).to.be.equal(0n);
  });

  it("should be able to withdraw", async () => {
    const { contract, account1 } = await loadFixture(deploy);

    await contract.deposit({ value: 10 });
    const signer = contract.connect(account1);
    await signer.deposit({ value: 1 });

    expect(
      await ethers.provider.getBalance(contract.getAddress()),
      "Contract balance should be 11",
    ).to.be.equal(11n);

    await signer.withdraw(1);

    expect(
      await ethers.provider.getBalance(contract.getAddress()),
      "Contract balance should be 0",
    ).to.be.equal(10n);

    expect(
      await ethers.provider.getBalance(account1.address),
      "Attacker balance should be 1",
    ).to.be.changeEtherBalance(account1, 1);
  });
});
