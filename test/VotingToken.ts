import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  VotingLinkedList__factory,
  YarreToken__factory,
} from "../typechain-types";
import { EMPTY_BYTES32, VotingLinkedList } from "../utils/list";

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

  describe("Voting", async () => {
    it("Should vote one", async () => {
      const { yarreToken, account1, premiumVoteAmount, votingTime } =
        await loadFixture(deploy);

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });

      await signer1.vote(500, EMPTY_BYTES32);

      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();
      expect(await signer1.isVoting()).to.be.equal(false);
      expect(await signer1.price()).to.be.equal(500);
    });

    it("Should vote multiple pushes", async () => {
      const {
        yarreToken,
        account1,
        account2,
        account3,
        premiumVoteAmount,
        votingTime,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 2n });
      const signer3 = yarreToken.connect(account3);
      await signer3["buy()"]({ value: premiumVoteAmount * 3n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer2.vote(1500, votingList.getId(0, 500));
      await signer3.vote(1000, votingList.getId(0, 1500));

      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();
      expect(await signer1.isVoting()).to.be.equal(false);

      expect(await signer1.price()).to.be.equal(1000);
    });

    it("Should vote multiple pushes with insert", async () => {
      const {
        yarreToken,
        account1,
        account2,
        account3,
        premiumVoteAmount,
        votingTime,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 2n });
      const signer3 = yarreToken.connect(account3);
      await signer3["buy()"]({ value: premiumVoteAmount * 3n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer3.vote(2000, votingList.getId(0, 500));
      await signer2.vote(1500, votingList.getId(0, 500));

      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();
      expect(await signer1.isVoting()).to.be.equal(false);
      expect(await signer1.price()).to.be.equal(2000);
    });

    it("Should vote multiple pushes with multiple inserts", async () => {
      const {
        yarreToken,
        account1,
        account2,
        account3,
        account4,
        premiumVoteAmount,
        votingTime,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 2n });
      const signer3 = yarreToken.connect(account3);
      await signer3["buy()"]({ value: premiumVoteAmount * 3n });
      const signer4 = yarreToken.connect(account4);
      await signer4["buy()"]({ value: premiumVoteAmount * 4n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer4.vote(1000, votingList.getId(0, 500));
      await signer2.vote(1500, votingList.getId(0, 500));
      await signer3.vote(2000, votingList.getId(0, 1500));

      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();
      expect(await signer1.isVoting()).to.be.equal(false);
      expect(await signer1.price()).to.be.equal(1000);
    });
  });

  describe("Interacting with tokens whilst voting", async () => {
    // it("Should buy tokens", async () => {
    //   const {
    //     yarreToken,
    //     account1,
    //     account2,
    //     initialPrice,
    //     premiumVoteAmount,
    //     votingTime,
    //     votingContractList,
    //   } = await loadFixture(deploy);

    //   const votingList = new VotingLinkedList();

    //   const signer1 = yarreToken.connect(account1);
    //   await signer1["buy()"]({ value: premiumVoteAmount });
    //   const signer2 = yarreToken.connect(account2);
    //   await signer2["buy()"]({ value: premiumVoteAmount * 2n });

    //   await signer1.vote(500, EMPTY_BYTES32);
    //   await signer2.vote(1500, votingList.getId(500));

    //   expect(await signer1._leadingPrice()).to.be.equal(1500);

    //   let amount = ethers.parseEther("10");

    //   await signer1["buy(bytes32)"](votingList.getId(1500), { value: amount });

    //   amount += premiumVoteAmount;

    //   const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
    //   let expectedBalance = amount * initialPrice;
    //   const fee = (expectedBalance * feePercentage) / BigInt(10000);
    //   expectedBalance -= fee;

    //   const totalFee =
    //     ((amount + premiumVoteAmount * 2n) * initialPrice * feePercentage) /
    //     BigInt(10000);

    //   expect(await yarreToken._leadingPrice()).to.be.equal(500);

    //   expect(await yarreToken.getFeeBalance()).to.equal(totalFee);

    //   expect(await signer1.balanceOf(account1.address)).to.equal(
    //     expectedBalance,
    //   );

    //   expect(await signer1.isVoting()).to.be.equal(true);

    //   await time.increase(votingTime);
    //   await signer1.stopVoting();
    //   expect(await signer1.isVoting()).to.be.equal(false);

    //   expect(await signer1.price()).to.be.equal(500);
    // });

    it("Should buy tokens with voting after", async () => {
      const { yarreToken, account1, account2, premiumVoteAmount, votingTime } =
        await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 2n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer2.vote(1500, votingList.getId(0, 500));

      expect(await signer1._leadingPrice()).to.be.equal(1500);

      const amount = ethers.parseEther("10");

      await signer1["buy(bytes32)"](votingList.getId(0, 1500), {
        value: amount,
      });

      expect(await yarreToken._leadingPrice()).to.be.equal(500);
      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();

      expect(await signer1.isVoting()).to.be.equal(false);
      expect(await signer1.price()).to.be.equal(500);
    });

    it("Should sell tokens with voting after", async () => {
      const {
        yarreToken,
        account1,
        account2,
        premiumVoteAmount,
        votingTime,
        initialPrice,
        votingContractList,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount * 5n });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 6n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer2.vote(1500, votingList.getId(0, 500));

      expect(await signer1._leadingPrice()).to.be.equal(1500);

      const amount = premiumVoteAmount * 3n * initialPrice;

      await signer2.approve(await yarreToken.getAddress(), amount);
      await signer2["sell(uint256,bytes32)"](amount, EMPTY_BYTES32);

      expect(await yarreToken._leadingPrice()).to.be.equal(500);
      expect(await signer2.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer2.stopVoting();

      expect(await signer2.isVoting()).to.be.equal(false);
      expect(await signer2.price()).to.be.equal(500);
    });

    it("Should transfer tokens with voting after", async () => {
      const {
        yarreToken,
        account1,
        account2,
        premiumVoteAmount,
        votingTime,
        initialPrice,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount * 5n });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 6n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer2.vote(1500, votingList.getId(0, 500));

      expect(await signer1._leadingPrice()).to.be.equal(1500);

      const amount = premiumVoteAmount * 3n * initialPrice;

      await signer2["transfer(address,uint256,bytes32,bytes32)"](
        account1.address,
        amount,
        EMPTY_BYTES32,
        votingList.getId(0, 1500),
      );

      expect(await yarreToken._leadingPrice()).to.be.equal(500);
      expect(await signer2.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer2.stopVoting();

      expect(await signer2.isVoting()).to.be.equal(false);
      expect(await signer2.price()).to.be.equal(500);
    });

    it("Should transferFrom tokens with voting after", async () => {
      const {
        yarreToken,
        account1,
        account2,
        account3,
        premiumVoteAmount,
        votingTime,
        initialPrice,
        votingContractList,
      } = await loadFixture(deploy);

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount * 5n });
      const signer2 = yarreToken.connect(account2);
      await signer2["buy()"]({ value: premiumVoteAmount * 6n });
      const signer3 = yarreToken.connect(account3);
      await signer3["buy()"]({ value: premiumVoteAmount * 7n });

      await signer1.vote(500, EMPTY_BYTES32);
      await signer2.vote(1500, votingList.getId(0, 500));
      await signer3.vote(1000, votingList.getId(0, 1500));

      expect(await signer1._leadingPrice()).to.be.equal(1000);

      const amount = premiumVoteAmount * 3n * initialPrice;

      // await votingContractList.traverse();

      await signer3.approve(await account1.getAddress(), amount);
      await signer2["transferFrom(address,address,uint256,bytes32,bytes32)"](
        account3.address,
        account1.address,
        amount,
        EMPTY_BYTES32,
        votingList.getId(0, 1500),
      );

      expect(await yarreToken._leadingPrice()).to.be.equal(500);
      expect(await signer3.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer3.stopVoting();

      expect(await signer3.isVoting()).to.be.equal(false);
      expect(await signer3.price()).to.be.equal(500);
    });
  });
});
