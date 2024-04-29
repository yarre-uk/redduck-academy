import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Vesting1__factory, YarreToken__factory } from "../typechain-types";

const ACCOUNT_NUMBER = 1000;

describe("Vesting1", async () => {
  async function deploy() {
    const [owner] = await ethers.getSigners();

    const tokenContract = await new YarreToken__factory(owner).deploy(
      10000n * BigInt(ACCOUNT_NUMBER),
      10000,
    );

    const vestingContract = await new Vesting1__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    await tokenContract.transfer(
      vestingContract.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    return {
      tokenContract,
      vestingContract,
      owner,
    };
  }

  it("should work", async () => {
    const { tokenContract, vestingContract, owner } = await loadFixture(deploy);

    const accounts = [];
    const promises = [];

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = ethers.Wallet.createRandom(ethers.provider);

      owner.sendTransaction({
        to: account.address,
        value: ethers.parseEther("0.001"),
      });

      promises.push(vestingContract.addAddress(account.address));
      accounts.push(account);
    }

    await Promise.all(promises);

    console.log("---");

    await time.increase(60 * 60 * 24 * 365 * 2);

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = accounts[i];
      const signer = vestingContract.connect(account);
      await signer.claim();
      expect(await tokenContract.balanceOf(account.address)).to.equal(10000n);

      if (i % 10 === 0) {
        console.log(i);
      }
    }
  }).timeout(100000000);
});
