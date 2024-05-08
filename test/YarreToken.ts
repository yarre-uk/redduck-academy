import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// eslint-disable-next-line camelcase
import {
  VotingLinkedList__factory,
  YarreToken__factory,
} from "../typechain-types";
import { EMPTY_BYTES32 } from "../utils/list";

describe("YarreToken", async () => {
  async function deploy() {
    const [owner, account1, account2, account3, account4] =
      await ethers.getSigners();

    const initialSupply = ethers.parseEther("10000");
    const initialPrice = 1000n; // 1 ether = 1000 tokens
    const baseVoteAmount = ethers.parseEther("0.01");
    const premiumVoteAmount = ethers.parseEther("0.1");
    const votingTime = 60 * 60 + 60 * 60 * 24; // 25 hours

    const yarreToken = await new YarreToken__factory(owner).deploy(
      initialSupply,
      initialPrice,
    );

    const votingContractList = await new VotingLinkedList__factory(
      owner,
    ).deploy();

    await yarreToken.setVotingList(votingContractList.getAddress());

    expect(await yarreToken.balanceOf(owner.address)).to.equal(
      ethers.parseEther("10000"),
    );

    return {
      yarreToken,
      owner,
      account1,
      account2,
      account3,
      account4,
      initialSupply,
      initialPrice,
      baseVoteAmount,
      premiumVoteAmount,
      votingTime,
      votingContractList,
    };
  }

  describe("Deployment", async () => {
    it("Should set the right totalSupply", async () => {
      const { yarreToken, initialSupply } = await loadFixture(deploy);

      expect(await yarreToken.totalSupply()).to.equal(initialSupply);
    });

    it("Only owner should be able to access", async function () {
      const { yarreToken } = await loadFixture(deploy);

      expect(await yarreToken.getFeeBalance()).to.equal(0);
    });

    it("Should fail because only owner may access", async function () {
      const { yarreToken, account1 } = await loadFixture(deploy);

      await expect(
        yarreToken.connect(account1).getFeeBalance(),
      ).to.be.rejectedWith("Ownable: caller is not the owner");
    });
  });

  describe("Buying and selling tokens", async () => {
    it("Should buy tokens", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await yarreToken.getFeeBalance()).to.equal(fee);

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance,
      );
    });

    it("Should sell tokens", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance,
      );

      await signer1.approve(yarreToken.getAddress(), expectedBalance);
      await signer1["sell(uint256)"](expectedBalance);

      expect(await signer1.balanceOf(account1.address)).to.equal(0);

      expect(await ethers.provider.getBalance(account1.address)).to.be.lessThan(
        ethers.parseEther("10000"),
      );
    });

    it("Should not sell more tokens than user has", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance,
      );

      await expect(
        signer1["sell(uint256)"](expectedBalance + 1n),
      ).to.be.rejectedWith("Insufficient balance");
    });
  });

  describe("Transfer and withdraw", async () => {
    it("Should transfer tokens", async () => {
      const { yarreToken, owner, account1, initialSupply } =
        await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);

      await yarreToken["transfer(address,uint256)"](account1.address, amount);

      expect(await signer1.balanceOf(account1.address)).to.equal(amount);
      expect(await yarreToken.balanceOf(owner.address)).to.equal(
        initialSupply - amount,
      );
    });

    it("Should approve tokens", async () => {
      const { yarreToken, owner, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");

      await yarreToken.approve(account1.address, amount);

      expect(
        await yarreToken.allowance(owner.address, account1.address),
      ).to.equal(amount);
    });

    it("Should transferFrom tokens", async () => {
      const { yarreToken, owner, account1, initialSupply, account2 } =
        await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      const signer2 = yarreToken.connect(account2);

      await yarreToken.approve(account1.address, amount);
      await signer2["transferFrom(address,address,uint256)"](
        owner.address,
        account1.address,
        amount,
      );

      expect(await signer1.balanceOf(account1.address)).to.equal(amount);
      expect(await yarreToken.balanceOf(owner.address)).to.equal(
        initialSupply - amount,
      );
    });
  });

  describe("Events", async () => {
    it("Should emit Approval event", async () => {
      const { yarreToken, owner, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");

      const receipt = await yarreToken.approve(account1.address, amount);

      expect(receipt)
        .to.emit(yarreToken, "Approval")
        .withArgs(owner.address, account1.address, amount);
    });

    it("Should emit Transfer event", async () => {
      const { yarreToken, owner, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");

      const receipt = await yarreToken["transfer(address,uint256)"](
        account1.address,
        amount,
      );

      expect(receipt)
        .to.emit(yarreToken, "Transfer")
        .withArgs(owner.address, account1.address, amount);
    });

    it("Should emit VotingStarted event", async () => {
      const { yarreToken, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const receipt = await signer1.vote(500, EMPTY_BYTES32);

      expect(receipt)
        .to.emit(yarreToken, "VotingStarted")
        .withArgs(account1.address, 1, 0);
    });

    it("Should emit VotingEnded event", async () => {
      const { yarreToken, account1, votingTime } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      await signer1.vote(500, EMPTY_BYTES32);

      await time.increase(votingTime);

      const receipt = await signer1.stopVoting();

      expect(receipt).to.emit(yarreToken, "VotingEnded").withArgs(1, 500);
    });

    it("Should emit Voted event", async () => {
      const { yarreToken, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const receipt = await signer1.vote(500, EMPTY_BYTES32);

      expect(receipt)
        .to.emit(yarreToken, "Voted")
        .withArgs(account1.address, 500);
    });

    it("Should emit Transfer on buy", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      const receipt = await signer1["buy()"]({ value: amount });

      const feePercentage = await signer1.feePercentage();
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance,
      );
      expect(receipt)
        .to.emit(yarreToken, "Transfer")
        .withArgs("0x", account1.address, expectedBalance);
    });

    it("Should emit Transfer on sell", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: amount });

      const feePercentage = await signer1.feePercentage();
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      await signer1.approve(yarreToken.getAddress(), expectedBalance);
      const receipt = await signer1["sell(uint256)"](expectedBalance);

      expect(await signer1.balanceOf(account1.address)).to.equal(0);
      expect(receipt)
        .to.emit(yarreToken, "Transfer")
        .withArgs(account1.address, "0x", expectedBalance);
    });

    it("Should emit Vote and StartVoting on first vote", async () => {
      const { yarreToken, account1, premiumVoteAmount } =
        await loadFixture(deploy);

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });

      const receipt = await signer1.vote(500, EMPTY_BYTES32);

      expect(receipt)
        .to.emit(yarreToken, "Voted")
        .withArgs(account1.address, 500);
      expect(receipt)
        .to.emit(yarreToken, "VotingStarted")
        .withArgs(account1.address, 1, 0);
    });
  });
});
