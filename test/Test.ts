import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Test__factory } from "../typechain-types";

const DEFAULT_BALANCE = 10000;

describe("Test", function () {
  async function deployTest() {
    const [alice, bob] = await ethers.getSigners();

    const test = await new Test__factory(bob).deploy();

    return { test, alice, bob };
  }

  async function getBalance(address: string) {
    const balance = await ethers.provider.getBalance(address);
    return parseInt(ethers.formatEther(balance));
  }

  describe("Deployment", function () {
    it("Check the owner", async function () {
      const { test, bob } = await loadFixture(deployTest);

      expect(await test.owner()).to.equal(bob.address);
    });

    it("Check Alice's balance", async function () {
      const { alice } = await loadFixture(deployTest);
      await expect(getBalance(alice.address)).to.eventually.equal(
        DEFAULT_BALANCE
      );
    });

    it("Check Bob's balance", async function () {
      const { bob } = await loadFixture(deployTest);
      await expect(getBalance(bob.address)).to.eventually.lessThan(
        DEFAULT_BALANCE
      );
    });
  });

  describe("Interactions", function () {
    describe("Deposits", function () {
      it("Alice should send the funds to the contract", async function () {
        const { test, alice } = await loadFixture(deployTest);
        const testWithSigner = test.connect(alice);
        const result = await testWithSigner.deposit({
          value: ethers.parseEther("1"),
        });

        await expect(result).to.changeEtherBalances(
          [test, alice],
          [ethers.parseEther("1"), ethers.parseEther("-1")]
        );
      });

      it("Bob should send the funds to the contract", async function () {
        const { test, bob } = await loadFixture(deployTest);
        const result = await test.deposit({ value: ethers.parseEther("1") });

        await expect(result).to.changeEtherBalances(
          [test, bob],
          [ethers.parseEther("1"), ethers.parseEther("-1")]
        );
      });
    });

    describe("Withdrawals", function () {
      it("Alice should send the funds and withdraw them", async function () {
        const { test, alice } = await loadFixture(deployTest);
        const testWithSigner = test.connect(alice);

        const deposit = await testWithSigner.deposit({
          value: ethers.parseEther("1"),
        });
        await expect(deposit).to.changeEtherBalances(
          [test, alice],
          [ethers.parseEther("1"), ethers.parseEther("-1")]
        );

        const withdraw = await testWithSigner.withdraw(ethers.parseEther("1"));
        await expect(withdraw).to.changeEtherBalances(
          [test, alice],
          [ethers.parseEther("-1"), ethers.parseEther("1")]
        );
      });
    });

    describe("Validations", function () {
      it("Should fail if you try to withdraw more that available", async () => {
        const { test, alice } = await loadFixture(deployTest);
        const testWithSigner = test.connect(alice);

        const deposit = await testWithSigner.deposit({
          value: ethers.parseEther("1"),
        });
        await expect(deposit).to.changeEtherBalances(
          [test, alice],
          [ethers.parseEther("1"), ethers.parseEther("-1")]
        );

        await expect(testWithSigner.withdraw(ethers.parseEther("2"))).to.be
          .reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on deposits", async function () {
        const { test, alice } = await loadFixture(deployTest);
        const testWithSigner = test.connect(alice);

        await expect(testWithSigner.deposit({ value: ethers.parseEther("1") }))
          .to.emit(testWithSigner, "DepositEvent")
          .withArgs(alice.address, ethers.parseEther("1"));
      });

      it("Should emit an event on withdrawals", async function () {
        const { test, alice } = await loadFixture(deployTest);
        const testWithSigner = test.connect(alice);

        await testWithSigner.deposit({ value: ethers.parseEther("1") });

        await expect(testWithSigner.withdraw(ethers.parseEther("1")))
          .to.emit(testWithSigner, "WithdrawEvent")
          .withArgs(alice.address, ethers.parseEther("1"));
      });
    });
  });
});
