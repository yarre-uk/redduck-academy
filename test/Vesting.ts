import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import keccak256 from "keccak256";

import {
  Vesting1__factory,
  Vesting2__factory,
  Vesting3__factory,
  YarreToken__factory,
} from "../typechain-types";
import MerkleTree from "../utils/merkle";

const ACCOUNT_NUMBER = 100;

describe("Vesting", async () => {
  async function deploy() {
    const [owner, acc1, acc2] = await ethers.getSigners();

    const tokenContract = await new YarreToken__factory(owner).deploy(
      10000n * BigInt(ACCOUNT_NUMBER) * 3n,
      10,
    );

    const vestingContract1 = await new Vesting1__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    const vestingContract2 = await new Vesting2__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    const vestingContract3 = await new Vesting3__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    await tokenContract["transfer(address,uint256)"](
      vestingContract1.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    await tokenContract["transfer(address,uint256)"](
      vestingContract2.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    await tokenContract["transfer(address,uint256)"](
      vestingContract3.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    return {
      tokenContract,
      vestingContract1,
      vestingContract2,
      vestingContract3,
      owner,
      acc1,
      acc2,
    };
  }

  it("should work plain", async () => {
    const { tokenContract, vestingContract1, owner } =
      await loadFixture(deploy);

    const accounts = [];
    const promises = [];

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = ethers.Wallet.createRandom(ethers.provider);

      owner.sendTransaction({
        to: account.address,
        value: ethers.parseEther("0.001"),
      });

      promises.push(vestingContract1.addAddress(account.address));
      accounts.push(account);
    }

    await Promise.all(promises);

    // console.log("---");

    await time.increase(60 * 60 * 24 * 365 * 2);

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = accounts[i];
      const signer = vestingContract1.connect(account);
      await signer.claim();
      expect(await tokenContract.balanceOf(account.address)).to.equal(10000n);
    }
  }).timeout(100000000);

  it("should work Merkle", async () => {
    const { tokenContract, vestingContract2, owner } =
      await loadFixture(deploy);

    const accounts = [];

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = ethers.Wallet.createRandom(ethers.provider);

      owner.sendTransaction({
        to: account.address,
        value: ethers.parseEther("0.001"),
      });

      accounts.push(account);
    }

    const addresses = accounts.map((account) =>
      ethers.keccak256(account.address),
    );

    const tree = new MerkleTree(addresses);

    await vestingContract2.setRoot(tree.getMerkleRoot());

    // console.log("---");

    await time.increase(60 * 60 * 24 * 365 * 2);

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = accounts[i];
      const signer = vestingContract2.connect(account);
      const proof = tree.getMerkleProof(i);
      await signer.claim(proof);
      expect(await tokenContract.balanceOf(account.address)).to.equal(10000n);
    }
  }).timeout(100000000);

  it("should work Signature", async () => {
    const { tokenContract, vestingContract3, owner, acc1, acc2 } =
      await loadFixture(deploy);

    let nonce = 0;

    const signMessage = async (
      to: string,
      amount: number,
      contractAddress: string,
    ) => {
      const hash = keccak256(
        ethers.solidityPacked(
          ["address", "uint256", "uint256", "address"],
          [to, amount, nonce++, contractAddress],
        ),
      );

      return owner.signMessage(hash);
    };

    const sig1 = await signMessage(
      acc1.address,
      10000,
      await vestingContract3.getAddress(),
    );

    const sig2 = await signMessage(
      acc2.address,
      5000,
      await vestingContract3.getAddress(),
    );

    await time.increase(60 * 60 * 24 * 365 * 2);

    await vestingContract3.connect(acc1).claim(10000, 0, sig1);

    expect(await tokenContract.balanceOf(acc1.address)).to.equal(10000);

    await vestingContract3.connect(acc2).claim(5000, 1, sig2);

    expect(await tokenContract.balanceOf(acc2.address)).to.equal(5000);
  }).timeout(100000000);
});
