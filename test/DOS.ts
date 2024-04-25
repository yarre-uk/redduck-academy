import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type HDNodeWallet, Wallet } from "ethers";
import { ethers } from "hardhat";

import { DOS__factory } from "../typechain-types";

describe("DOS", async () => {
  async function deploy() {
    const [owner, account1] = await ethers.getSigners();

    const contract = await new DOS__factory(owner).deploy();

    const accountsAmount = 1000;

    const accounts: HDNodeWallet[] = [];

    for (let i = 0; i < accountsAmount; i++) {
      const account = Wallet.createRandom().connect(ethers.provider);
      accounts.push(account);
    }

    await Promise.allSettled(
      accounts.map((account) => {
        return owner.sendTransaction({
          to: account.address,
          value: ethers.parseEther("0.01"),
        });
      }),
    );

    console.log("---");

    return {
      contract,
      account1,
      owner,
      accounts,
    };
  }

  it("should not fail", async () => {
    const { contract, accounts } = await loadFixture(deploy);

    for (let i = 0; i < accounts.length; i++) {
      const signer = contract.connect(accounts[i]);
      await signer.deposit({ value: 1n, gasLimit: 100000 });
      await signer.vote(100, { gasLimit: 100000 });

      if (i % 10 === 0) {
        console.log(`i = ${i}`);
      }
    }

    await contract.concludeVoting();
  }).timeout(10000000);
});
