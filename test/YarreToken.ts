import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { YarreToken__factory } from "../typechain-types";

describe("YarreToken", async () => {
  async function deploy() {
    const [owner, account1, account2, account3] = await ethers.getSigners();

    const initialSupply = ethers.parseEther("10000");
    const initialPrice = 1000n; // 1 ether = 1000 tokens
    const baseVoteAmount = ethers.parseEther("0.01");
    const premiumVoteAmount = ethers.parseEther("0.1");
    const votingTime = 60 * 60 + 60 * 60 * 24; // 25 hours

    const yarreToken = await new YarreToken__factory(owner).deploy(
      initialSupply,
      initialPrice
    );

    expect(await yarreToken.balanceOf(owner.address)).to.equal(
      ethers.parseEther("10000")
    );

    return {
      yarreToken,
      owner,
      account1,
      account2,
      account3,
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

      expect(await yarreToken.getBalance()).to.equal(0);
    });

    it("Should fail because only owner may access", async function () {
      const { yarreToken, account1 } = await loadFixture(deploy);

      await expect(
        yarreToken.connect(account1).getBalance()
      ).to.be.rejectedWith("Ownable: caller is not the owner");
    });
  });

  describe("Buying and selling tokens", async () => {
    it("Should buy tokens", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance
      );
    });

    it("Should sell tokens", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance
      );

      await signer1.sell(expectedBalance);

      expect(await signer1.balanceOf(account1.address)).to.equal(0);

      expect(await ethers.provider.getBalance(account1.address)).to.be.lessThan(
        ethers.parseEther("10000")
      );
    });

    it("Should not sell more tokens than user has", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance
      );

      await expect(signer1.sell(expectedBalance + 1n)).to.be.rejectedWith(
        "Insufficient balance"
      );
    });
  });

  describe("Transfer and withdraw", async () => {
    it("Should transfer tokens", async () => {
      const { yarreToken, owner, account1, initialSupply } = await loadFixture(
        deploy
      );

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);

      await yarreToken.transfer(account1.address, amount);

      expect(await signer1.balanceOf(account1.address)).to.equal(amount);
      expect(await yarreToken.balanceOf(owner.address)).to.equal(
        initialSupply - amount
      );
    });

    it("Should approve tokens", async () => {
      const { yarreToken, owner, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");

      await yarreToken.approve(account1.address, amount);

      expect(
        await yarreToken.allowance(owner.address, account1.address)
      ).to.equal(amount);
    });

    it("Should transferFrom tokens", async () => {
      const { yarreToken, owner, account1, initialSupply, account2 } =
        await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      const signer2 = yarreToken.connect(account2);

      await yarreToken.approve(account1.address, amount);
      await signer2.transferFrom(owner.address, account1.address, amount);

      expect(await signer1.balanceOf(account1.address)).to.equal(amount);
      expect(await yarreToken.balanceOf(owner.address)).to.equal(
        initialSupply - amount
      );
    });
  });

  describe("Voting", async () => {
    it("Check percentage calculations", async () => {
      const { yarreToken, owner, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const totalSupply = await signer1.totalSupply();
      const balance = await signer1.balanceOf(account1.address);
      const expected = (balance * 10000n) / totalSupply;

      expect(expected).to.be.equal(await signer1.userPercentage());
    });

    describe("Voting", async () => {
      it("Should start voting if user has 0.1%", async () => {
        const { yarreToken, owner, account1 } = await loadFixture(deploy);

        const amount = ethers.parseEther("1");

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: amount });

        await signer1.vote(500);

        expect(await signer1.isVoting()).to.be.true;
      });

      it("Should not start voting if user has less than 0.1%", async () => {
        const { yarreToken, account1, baseVoteAmount } = await loadFixture(
          deploy
        );

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: baseVoteAmount });

        await expect(signer1.vote(500)).to.be.rejectedWith(
          "Voting is not started"
        );
      });

      it("Should not with lessThan 0.05%", async () => {
        const { yarreToken, account1, baseVoteAmount } = await loadFixture(
          deploy
        );

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: baseVoteAmount / 2n });

        await expect(signer1.vote(500)).to.be.rejectedWith(
          "Can't vote with such small amount of tokens"
        );
      });

      it("Should fail if user will try to vote the price that isn't in voting list 0.05%", async () => {
        const { yarreToken, account1, baseVoteAmount } = await loadFixture(
          deploy
        );

        await yarreToken.vote(1500);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: baseVoteAmount });

        await expect(signer1.vote(950)).to.be.rejectedWith(
          "Price is not in the voting list"
        );
      });

      it("Should not start voting if user has already voted", async () => {
        const { yarreToken, account1, premiumVoteAmount } = await loadFixture(
          deploy
        );

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });

        await signer1.vote(500);

        await expect(signer1.vote(500)).to.be.rejectedWith(
          "User has already voted"
        );
      });

      it("Should be able to vote the same price of someone who has voted with 0.1%", async () => {
        const { yarreToken, account1, baseVoteAmount } = await loadFixture(
          deploy
        );

        yarreToken.vote(1500);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: baseVoteAmount });

        await expect(signer1.vote(500)).to.be.rejectedWith(
          "Price is not in the voting list"
        );
      });
    });

    describe("Starting and stopping", async () => {
      it("Should not stop voting if time hasn't passed", async () => {
        const { yarreToken, account1, premiumVoteAmount, votingTime } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });

        await signer1.vote(500);

        await expect(signer1.stopVoting()).to.be.rejectedWith(
          "Voting time hasn't passed"
        );
      });

      it("Should stop voting if time has passed", async () => {
        const { yarreToken, account1, premiumVoteAmount, votingTime } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });

        await signer1.vote(500);

        await time.increase(votingTime);

        await signer1.stopVoting();

        expect(await signer1.isVoting()).to.be.false;
      });

      it("Should not stop voting if it hasn't been started", async () => {
        const { yarreToken } = await loadFixture(deploy);

        await expect(yarreToken.stopVoting()).to.be.rejectedWith(
          "Voting is not started"
        );
      });

      it("Should change the price after each new voting", async () => {
        const {
          yarreToken,
          account1,
          account2,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        const signer2 = yarreToken.connect(account2);

        await signer1.buy({ value: premiumVoteAmount });
        await signer2.buy({ value: premiumVoteAmount * 2n });

        await signer1.vote(500);
        await signer2.vote(1500);
        await time.increase(votingTime);
        await yarreToken.stopVoting();
        expect(await yarreToken.price()).to.be.equal(1500);

        await signer1.buy({ value: premiumVoteAmount * 2n });

        await signer1.vote(2000);
        await signer2.vote(500);
        await time.increase(votingTime);
        await yarreToken.stopVoting();
        expect(await yarreToken.price()).to.be.equal(2000);
      });
    });

    describe("Price changing", async () => {
      it("Should change price if voting has ended", async () => {
        const { yarreToken, account1, premiumVoteAmount, votingTime } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });

        await signer1.vote(500);

        await time.increase(votingTime);

        await signer1.stopVoting();

        expect(await signer1.price()).to.be.equal(500);
      });

      it("Should set the most voted price", async () => {
        const {
          yarreToken,
          account1,
          account2,
          premiumVoteAmount,
          votingTime,
        } = await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        const signer2 = yarreToken.connect(account2);

        await signer1.buy({ value: premiumVoteAmount });
        await signer2.buy({ value: premiumVoteAmount * 2n });

        await signer1.vote(500);
        await signer2.vote(1500);

        await time.increase(votingTime);

        await signer1.stopVoting();

        expect(await signer1.price()).to.be.equal(1500);
      });

      it("Should set the most voted price with multiple votes", async () => {
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

        await signer1.buy({ value: premiumVoteAmount * 2n });
        await signer2.buy({ value: premiumVoteAmount });
        await signer3.buy({ value: premiumVoteAmount * 3n });

        await signer1.vote(1500);
        await signer2.vote(500);
        await signer3.vote(500);

        await time.increase(votingTime);

        await signer1.stopVoting();

        expect(await signer1.price()).to.be.equal(500);
      });
    });

    describe("Blocking actions when voted", async () => {
      it("Should not be able to buy when voted", async () => {
        const { yarreToken, account1, premiumVoteAmount } = await loadFixture(
          deploy
        );

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });
        await signer1.vote(500);

        await expect(
          signer1.buy({ value: premiumVoteAmount })
        ).to.be.rejectedWith(
          "You have voted, cannot buy or sell, transfer or approve"
        );
      });

      it("Should not be able to sell when voted", async () => {
        const { yarreToken, account1, premiumVoteAmount } = await loadFixture(
          deploy
        );

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });
        await signer1.vote(500);

        await expect(signer1.sell(premiumVoteAmount)).to.be.rejectedWith(
          "You have voted, cannot buy or sell, transfer or approve"
        );
      });

      it("Should not be able to transfer when voted", async () => {
        const { yarreToken, owner, account1, premiumVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });
        await signer1.vote(500);

        await expect(signer1.transfer(owner.address, 1)).to.be.rejectedWith(
          "You have voted, cannot buy or sell, transfer or approve"
        );
      });

      it("Should not be able to approve when voted", async () => {
        const { yarreToken, owner, account1, premiumVoteAmount } =
          await loadFixture(deploy);

        const signer1 = yarreToken.connect(account1);
        await signer1.buy({ value: premiumVoteAmount });
        await signer1.vote(500);

        await expect(
          signer1.approve(owner.address, premiumVoteAmount)
        ).to.be.rejectedWith(
          "You have voted, cannot buy or sell, transfer or approve"
        );
      });
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

      const receipt = await yarreToken.transfer(account1.address, amount);

      expect(receipt)
        .to.emit(yarreToken, "Transfer")
        .withArgs(owner.address, account1.address, amount);
    });

    it("Should emit VotingStarted event", async () => {
      const { yarreToken, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const receipt = await signer1.vote(500);

      expect(receipt)
        .to.emit(yarreToken, "VotingStarted")
        .withArgs(account1.address, 1, 0);
    });

    it("Should emit VotingEnded event", async () => {
      const { yarreToken, account1, votingTime } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      await signer1.vote(500);

      await time.increase(votingTime);

      const receipt = await signer1.stopVoting();

      expect(receipt).to.emit(yarreToken, "VotingEnded").withArgs(1, 500);
    });

    it("Should emit Voted event", async () => {
      const { yarreToken, account1 } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: amount });

      const receipt = await signer1.vote(500);

      expect(receipt)
        .to.emit(yarreToken, "Voted")
        .withArgs(account1.address, 500);
    });

    it("Should emit Transfer on buy", async () => {
      const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

      const amount = ethers.parseEther("10");
      const signer1 = yarreToken.connect(account1);
      const receipt = await signer1.buy({ value: amount });

      const feePercentage = await signer1.feePercentage();
      let expectedBalance = amount * initialPrice;
      const fee = (expectedBalance * feePercentage) / BigInt(10000);
      expectedBalance -= fee;

      expect(await signer1.balanceOf(account1.address)).to.equal(
        expectedBalance
      );
      expect(receipt)
        .to.emit(yarreToken, "Transfer")
        .withArgs("0x", account1.address, expectedBalance);
    });

    it("Should emit Vote and StartVoting on first vote", async () => {
      const { yarreToken, account1, premiumVoteAmount } = await loadFixture(
        deploy
      );

      const signer1 = yarreToken.connect(account1);
      await signer1.buy({ value: premiumVoteAmount });

      const receipt = await signer1.vote(500);

      expect(receipt)
        .to.emit(yarreToken, "Voted")
        .withArgs(account1.address, 500);
      expect(receipt)
        .to.emit(yarreToken, "VotingStarted")
        .withArgs(account1.address, 1, 0);
    });
  });
});
