import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  Vesting1__factory,
  Vesting2__factory,
  YarreToken__factory,
} from "../typechain-types";

const ACCOUNT_NUMBER = 32;

function computeHash(computedHash: string, proofElement: string): string {
  const asd = ethers.keccak256(
    ethers.solidityPacked(["bytes32", "bytes32"], [computedHash, proofElement]),
  );

  return asd;
}

const oneLevelUp = (inputArray: string[]) => {
  const result = [];
  const inp = [...inputArray];
  let firstLayer = true;

  if (inp.length % 2 === 1) {
    inp.push(inp[inp.length - 1]);
  }

  for (let i = 0; i < inp.length; i += 2) {
    result.push(computeHash(inp[i], inp[i + 1]));
    firstLayer = false;
  }

  return result;
};

const getMerkleRoot = (array: string[]) => {
  let result = array;

  while (result.length > 1) {
    result = oneLevelUp(result);
  }

  return result[0];
};

const getMerkleProof = (array: string[], index: number) => {
  const result = [];
  let currentLayer = [...array];
  let currentIndex = index;
  let firstLayer = true;

  while (currentLayer.length > 1) {
    if (currentLayer.length % 2) {
      currentLayer.push(currentLayer[currentLayer.length - 1]);
    }

    if (!firstLayer) {
      result.push(
        currentIndex % 2
          ? currentLayer[currentIndex - 1]
          : currentLayer[currentIndex + 1],
      );
    } else {
      result.push(currentLayer[currentIndex]);
      firstLayer = false;
    }

    currentIndex = Math.floor(currentIndex / 2);
    currentLayer = oneLevelUp(currentLayer);
  }
  return result;
};

describe("Vesting1", async () => {
  async function deploy() {
    const [owner] = await ethers.getSigners();

    const tokenContract = await new YarreToken__factory(owner).deploy(
      10000n * BigInt(ACCOUNT_NUMBER) * 2n,
      10000,
    );

    const vestingContract1 = await new Vesting1__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    const vestingContract2 = await new Vesting2__factory(owner).deploy(
      tokenContract.getAddress(),
    );

    await tokenContract.transfer(
      vestingContract1.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    await tokenContract.transfer(
      vestingContract2.getAddress(),
      10000n * BigInt(ACCOUNT_NUMBER),
    );

    return {
      tokenContract,
      vestingContract1,
      vestingContract2,
      owner,
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

    console.log("---");

    await time.increase(60 * 60 * 24 * 365 * 2);

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = accounts[i];
      const signer = vestingContract1.connect(account);
      await signer.claim();
      expect(await tokenContract.balanceOf(account.address)).to.equal(10000n);

      if (i % 10 === 0) {
        console.log(i);
      }
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

    const root = getMerkleRoot(addresses);
    await vestingContract2.setRoot(root);

    console.log("---");

    await time.increase(60 * 60 * 24 * 365 * 2);

    for (let i = 0; i < ACCOUNT_NUMBER; i++) {
      const account = accounts[i];
      const signer = vestingContract2.connect(account);
      const proof = getMerkleProof(addresses, i);
      await signer.claim(proof);
      expect(await tokenContract.balanceOf(account.address)).to.equal(10000n);

      if (i % 10 === 0) {
        console.log(i);
      }
    }
  }).timeout(100000000);
});
