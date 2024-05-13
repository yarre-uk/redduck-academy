import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { YarreToken__factory } from "../typechain-types";
import { EMPTY_BYTES32, VotingLinkedList } from "../utils/list";

describe("Improved Voting", async () => {
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
    describe("Basic", async () => {
      it("Check percentage calculations", async () => {
        const { yarreToken, account1 } = await loadFixture(deploy);

        const amount = ethers.parseEther("1");

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: amount });

        const totalSupply = await signer1.totalSupply();
        const balance = await signer1.balanceOf(account1.address);
        const expected = (balance * 10000n) / totalSupply;

        expect(expected).to.be.equal(await signer1.userPercentage());
      });

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

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        const signer3 = yarreToken.connect(account3);
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));
        await signer3.vote(1000, VotingLinkedList.getId(0, 1500));

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

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        const signer3 = yarreToken.connect(account3);
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer3.vote(2000, VotingLinkedList.getId(0, 500));
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));

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

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        const signer3 = yarreToken.connect(account3);
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });
        const signer4 = yarreToken.connect(account4);
        await signer4["buy()"]({ value: premiumVoteAmount * 4n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer4.vote(1000, VotingLinkedList.getId(0, 500));
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));
        await signer3.vote(2000, VotingLinkedList.getId(0, 1500));

        expect(await signer1.isVoting()).to.be.equal(true);

        await time.increase(votingTime);
        await signer1.stopVoting();
        expect(await signer1.isVoting()).to.be.equal(false);
        expect(await signer1.price()).to.be.equal(1000);
      });

      it("Should vote multiple votes for same price", async () => {
        const {
          yarreToken,
          account1,
          account2,
          account3,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        const signer2 = yarreToken.connect(account2);
        const signer3 = yarreToken.connect(account3);

        await signer1["buy()"]({ value: premiumVoteAmount });
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(500, EMPTY_BYTES32);
        await signer3.vote(500, EMPTY_BYTES32);

        expect(await signer1.isVoting()).to.be.equal(true);

        await time.increase(votingTime);
        await signer1.stopVoting();
        expect(await signer1.isVoting()).to.be.equal(false);
        expect(await signer1.price()).to.be.equal(500);
      });

      it("Should vote multiple votes for same price and one for another", async () => {
        const {
          yarreToken,
          account1,
          account2,
          account3,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        const signer2 = yarreToken.connect(account2);
        const signer3 = yarreToken.connect(account3);

        await signer1["buy()"]({ value: premiumVoteAmount });
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1000, VotingLinkedList.getId(0, 500));

        expect(await yarreToken._leadingPrice()).to.be.equal(1000);

        await signer3.vote(500, VotingLinkedList.getId(0, 1000));

        expect(await signer1.isVoting()).to.be.equal(true);

        await time.increase(votingTime);
        await signer1.stopVoting();
        expect(await signer1.isVoting()).to.be.equal(false);
        expect(await signer1.price()).to.be.equal(500);
      });

      it("Should start voting if user has 0.1%", async () => {
        const { yarreToken, account1, premiumVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });

        await signer1.vote(500, EMPTY_BYTES32);

        expect(await signer1.isVoting()).to.be.equal(true);
      });

      it("Should not start voting if user has less than 0.1%", async () => {
        const { yarreToken, account1, baseVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: baseVoteAmount });

        await expect(signer1.vote(500, EMPTY_BYTES32)).to.be.rejectedWith(
          "Voting is not started",
        );
      });

      it("Should not with lessThan 0.05%", async () => {
        const { yarreToken, account1, baseVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: baseVoteAmount / 2n });

        await expect(signer1.vote(500, EMPTY_BYTES32)).to.be.rejectedWith(
          "Can't vote with such small amount of tokens",
        );
      });

      it("Should fail if user will try to vote the price that isn't in voting list 0.05%", async () => {
        const { yarreToken, account1, baseVoteAmount } =
          await loadFixture(deploy);

        await yarreToken.vote(1500, EMPTY_BYTES32);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: baseVoteAmount });

        await expect(signer1.vote(950, EMPTY_BYTES32)).to.be.rejectedWith(
          "Price is not in the voting list",
        );
      });

      it("Should not start voting if user has already voted", async () => {
        const { yarreToken, account1, premiumVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });

        await signer1.vote(500, EMPTY_BYTES32);

        await expect(
          signer1.vote(1000, VotingLinkedList.getId(0, 500)),
        ).to.be.rejectedWith("User has already voted");
      });

      it("Should be able to vote the same price of someone who has voted with 0.1%", async () => {
        const { yarreToken, account1, baseVoteAmount, votingTime } =
          await loadFixture(deploy);

        yarreToken.vote(1500, EMPTY_BYTES32);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: baseVoteAmount });

        await signer1.vote(1500, EMPTY_BYTES32);

        expect(await yarreToken.isVoting()).to.be.equal(true);

        await time.increase(votingTime);

        await signer1.stopVoting();
        expect(await yarreToken.isVoting()).to.be.equal(false);

        expect(await yarreToken.price()).to.be.equal(1500);
      });

      it("Should not be able to vote the same price of someone who has voted with 0.1%", async () => {
        const { yarreToken, account1, baseVoteAmount } =
          await loadFixture(deploy);

        yarreToken.vote(1500, EMPTY_BYTES32);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: baseVoteAmount });

        await expect(signer1.vote(500, EMPTY_BYTES32)).to.be.rejectedWith(
          "Price is not in the voting list",
        );
      });
    });

    describe("Voting whilst interacting", async () => {
      it("Should buy tokens with voting after", async () => {
        const {
          yarreToken,
          account1,
          account2,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));

        expect(await signer1._leadingPrice()).to.be.equal(1500);

        const amount = ethers.parseEther("10");

        await signer1["buy(bytes32)"](VotingLinkedList.getId(0, 1500), {
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
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount * 5n });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 6n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));

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

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount * 5n });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 6n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));

        expect(await signer1._leadingPrice()).to.be.equal(1500);

        const amount = premiumVoteAmount * 3n * initialPrice;

        await signer2["transfer(address,uint256,bytes32,bytes32)"](
          account1.address,
          amount,
          EMPTY_BYTES32,
          VotingLinkedList.getId(0, 1500),
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
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount * 5n });
        const signer2 = yarreToken.connect(account2);
        await signer2["buy()"]({ value: premiumVoteAmount * 6n });
        const signer3 = yarreToken.connect(account3);
        await signer3["buy()"]({ value: premiumVoteAmount * 7n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));
        await signer3.vote(1000, VotingLinkedList.getId(0, 1500));

        expect(await signer1._leadingPrice()).to.be.equal(1000);

        const amount = premiumVoteAmount * 3n * initialPrice;

        // await votingContractList.traverse();

        await signer3.approve(await account1.getAddress(), amount);
        await signer2["transferFrom(address,address,uint256,bytes32,bytes32)"](
          account3.address,
          account1.address,
          amount,
          EMPTY_BYTES32,
          VotingLinkedList.getId(0, 1500),
        );

        expect(await yarreToken._leadingPrice()).to.be.equal(500);
        expect(await signer3.isVoting()).to.be.equal(true);

        await time.increase(votingTime);
        await signer3.stopVoting();

        expect(await signer3.isVoting()).to.be.equal(false);
        expect(await signer3.price()).to.be.equal(500);
      });
    });

    describe("Starting and stopping", async () => {
      it("Should not stop voting if time hasn't passed", async () => {
        const { yarreToken, account1, premiumVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });

        await signer1.vote(500, EMPTY_BYTES32);

        await expect(signer1.stopVoting()).to.be.rejectedWith(
          "Voting time hasn't passed",
        );
      });

      it("Should stop voting if time has passed", async () => {
        const { yarreToken, account1, premiumVoteAmount, votingTime } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1["buy()"]({ value: premiumVoteAmount });

        await signer1.vote(500, EMPTY_BYTES32);

        await time.increase(votingTime);

        await signer1.stopVoting();

        expect(await signer1.isVoting()).to.be.equal(false);
        expect(await signer1.price()).to.be.equal(500);
      });

      it("Should not stop voting if it hasn't been started", async () => {
        const { yarreToken } = await loadFixture(deploy);

        await expect(yarreToken.stopVoting()).to.be.rejectedWith(
          "Voting is not started",
        );
      });

      it("Should change the price after each new voting", async () => {
        const {
          yarreToken,
          account1,
          account2,
          account3,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        const signer2 = yarreToken.connect(account2);
        const signer3 = yarreToken.connect(account3);

        await signer1["buy()"]({ value: premiumVoteAmount });
        await signer2["buy()"]({ value: premiumVoteAmount * 2n });
        await signer3["buy()"]({ value: premiumVoteAmount * 3n });

        await signer1.vote(500, EMPTY_BYTES32);
        await signer2.vote(1500, VotingLinkedList.getId(0, 500));

        await time.increase(votingTime);
        await yarreToken.stopVoting();
        expect(await yarreToken.price()).to.be.equal(1500);

        await signer1.vote(2000, EMPTY_BYTES32);
        await signer2.vote(5000, VotingLinkedList.getId(1, 2000));

        await time.increase(votingTime);
        await yarreToken.stopVoting();
        expect(await yarreToken.price()).to.be.equal(5000);

        await signer1.vote(1500, EMPTY_BYTES32);
        await signer2.vote(2000, VotingLinkedList.getId(2, 1500));
        await signer3.vote(1500, VotingLinkedList.getId(2, 2000));

        await time.increase(votingTime);
        await yarreToken.stopVoting();
        expect(await yarreToken.price()).to.be.equal(1500);
      });
    });
  });
});
