import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// eslint-disable-next-line camelcase
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

      const votingList = new VotingLinkedList();

      const signer1 = yarreToken.connect(account1);
      await signer1["buy()"]({ value: premiumVoteAmount });

      const prevId = votingList.push(500, Number(premiumVoteAmount));
      await signer1.vote(500, prevId);

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

      votingList.push(500, Number(premiumVoteAmount));
      await signer1.vote(500, EMPTY_BYTES32);

      votingList.push(1500, Number(premiumVoteAmount) * 2);
      await signer2.vote(1500, votingList.getId(500));

      votingList.push(1000, Number(premiumVoteAmount) * 3);
      await signer3.vote(1000, votingList.getId(1500));

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

      votingList.push(500, Number(premiumVoteAmount));
      await signer1.vote(500, EMPTY_BYTES32);

      votingList.push(2000, Number(premiumVoteAmount) * 3);
      await signer3.vote(2000, votingList.getId(500));

      votingList.insert(
        votingList.getId(500),
        1500,
        Number(premiumVoteAmount) * 2,
      );
      await signer2.vote(1500, votingList.getId(500));

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

      votingList.push(500, Number(premiumVoteAmount));
      await signer1.vote(500, EMPTY_BYTES32);

      votingList.push(1000, Number(premiumVoteAmount) * 4);
      await signer4.vote(1000, votingList.getId(500));

      votingList.insert(
        votingList.getId(500),
        1500,
        Number(premiumVoteAmount) * 2,
      );
      await signer2.vote(1500, votingList.getId(500));

      votingList.insert(
        votingList.getId(1500),
        2000,
        Number(premiumVoteAmount) * 3,
      );
      await signer3.vote(2000, votingList.getId(1500));

      expect(await signer1.isVoting()).to.be.equal(true);

      await time.increase(votingTime);
      await signer1.stopVoting();
      expect(await signer1.isVoting()).to.be.equal(false);
      expect(await signer1.price()).to.be.equal(1000);
    });
  });
});
