/* eslint-disable no-unused-expressions */
import {
  loadFixture,
  mine,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  GovernanceExtended__factory,
  GovernanceToken__factory,
  RaffleExtended__factory,
} from "../typechain-types";

function encodeParameters(
  actions: ("setX" | "setY" | "setZ")[],
  values: number[],
  description: string,
): [string[], string] {
  const iRaffle = new ethers.Interface([
    "function setX(uint256)",
    "function setY(uint256)",
    "function setZ(uint256)",
  ]);

  return [
    actions.map((action, index) =>
      iRaffle.encodeFunctionData(action, [values[index]]),
    ),
    description,
  ];
}

describe("Governance", () => {
  const deploy = async () => {
    const [owner, executer, user1, user2, user3, user4] =
      await ethers.getSigners();

    const governanceContract = await new GovernanceExtended__factory(
      owner,
    ).deploy({
      maxFeePerGas: 500000000,
    });

    const raffleContract = await new RaffleExtended__factory(owner).deploy({
      maxFeePerGas: 500000000,
    });

    const tokenContract = await new GovernanceToken__factory(owner).deploy({
      maxFeePerGas: 500000000,
    });

    await tokenContract.mint(owner.address, 1000000);

    await tokenContract.delegate(user1.address);
    await tokenContract.connect(user1).delegate(user2.address);
    await tokenContract.connect(user2).delegate(user3.address);
    await tokenContract.connect(user3).delegate(user4.address);

    await tokenContract.transfer(user1.address, 400000);
    await tokenContract.connect(user1).transfer(user2.address, 300000);
    await tokenContract.connect(user2).transfer(user3.address, 200000);
    await tokenContract.connect(user3).transfer(user4.address, 100000);

    await governanceContract.initialize(
      await tokenContract.getAddress(),
      await raffleContract.getAddress(),
      executer.address,
      100,
      100,
      100,
    );

    await raffleContract.setGovernor(await governanceContract.getAddress());

    return {
      contracts: {
        governance: governanceContract,
        raffle: raffleContract,
        token: tokenContract,
      },
      users: {
        owner,
        executer,
        user1,
        user2,
        user3,
        user4,
      },
    };
  };

  describe("Deployment", () => {
    it("Should deploy the contract", async () => {
      const {
        contracts: { governance, raffle, token },
      } = await loadFixture(deploy);
      expect(governance).to.exist;
      expect(raffle).to.exist;
      expect(token).to.exist;

      expect(await raffle.X()).to.equal(0);
      expect(await raffle.Y()).to.equal(0);
      expect(await raffle.Z()).to.equal(0);

      await raffle.setX(10000);
      await raffle.setY(1000);
      await raffle.setZ(100);

      expect(await raffle.X()).to.equal(10000);
      expect(await raffle.Y()).to.equal(1000);
      expect(await raffle.Z()).to.equal(100);
    });
  });

  describe("Governance", () => {
    describe("Proposal interactions", () => {
      it("Should be able to propose", async () => {
        const {
          contracts: { governance },
          users: { user1 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        expect((await user1Sigher.getProposal(id))[0]).to.equal(user1.address);
      });

      it("Should be able to propose and vote", async () => {
        const {
          contracts: { governance },
          users: { user1, user2 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);

        expect((await user1Sigher.getProposal(id))[5]).to.equal(100000);
      });

      it("Should be able to propose and make multiple votes", async () => {
        const {
          contracts: { governance },
          users: { user1, user2, user3, user4 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);
        const user3Sigher = governance.connect(user3);
        const user4Sigher = governance.connect(user4);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);
        await user3Sigher.voteForProposal(id, true);
        await user4Sigher.voteForProposal(id, false);

        expect((await governance.getProposal(id))[5]).to.equal(200000);
        expect((await governance.getProposal(id))[6]).to.equal(100000);
      });

      it("Should be able to propose and execute", async () => {
        const {
          contracts: { governance, raffle },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);

        await mine(101, { interval: 0 });

        expect(await raffle.X()).to.equal(0);

        await executerSigher.processProposal(id);

        expect(await raffle.X()).to.equal(1000);
      });

      it("Should be able to propose and execute multiple", async () => {
        const {
          contracts: { governance, raffle },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(
            ["setX", "setY", "setZ"],
            [1000, 100, 10],
            "Set X to 1000, Y to 100, Z to 10",
          ),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(
            ["setX", "setY", "setZ"],
            [1000, 100, 10],
            "Set X to 1000, Y to 100, Z to 10",
          ),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);

        await mine(101, { interval: 0 });

        expect(await raffle.X()).to.equal(0);
        expect(await raffle.Y()).to.equal(0);
        expect(await raffle.Z()).to.equal(0);

        await executerSigher.processProposal(id);

        expect(await raffle.X()).to.equal(1000);
        expect(await raffle.Y()).to.equal(100);
        expect(await raffle.Z()).to.equal(10);
      });
    });

    describe("Proposal statuses", () => {
      it("Should be created", async () => {
        const {
          contracts: { governance },
          users: { user1 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        expect((await governance.getProposal(id))[7]).to.equal(0);
      });

      it("Should be executed", async () => {
        const {
          contracts: { governance, raffle },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);

        await mine(101, { interval: 0 });

        expect(await raffle.X()).to.equal(0);

        await executerSigher.processProposal(id);

        expect(await raffle.X()).to.equal(1000);
        expect((await governance.getProposal(id))[7]).to.equal(1);
      });

      it("Should be canceled", async () => {
        const {
          contracts: { governance, raffle },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, false);

        await mine(101, { interval: 0 });

        expect(await raffle.X()).to.equal(0);

        await executerSigher.processProposal(id);

        expect(await raffle.X()).to.equal(0);
        expect((await governance.getProposal(id))[7]).to.equal(2);
      });
    });

    describe("Events", function () {
      it("Should emit ProposalCreated event", async () => {
        const {
          contracts: { governance },
          users: { user1 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);

        const proposalTx = await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await expect(proposalTx)
          .to.emit(governance, "ProposalCreated")
          .withArgs(id, user1.address);
      });

      it("Should emit ProposalVoted event", async () => {
        const {
          contracts: { governance },
          users: { user1, user2 },
        } = await loadFixture(deploy);

        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        const voteTx = await user2Sigher.voteForProposal(id, true);

        await expect(voteTx)
          .to.emit(governance, "ProposalVoted")
          .withArgs(id, user2.address, true);
      });

      it("Should emit ProposalProcessed event with ProposalState.Executed", async () => {
        const {
          contracts: { governance },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, true);

        await mine(101, { interval: 0 });

        const processTx = await executerSigher.processProposal(id);

        await expect(processTx)
          .to.emit(governance, "ProposalProcessed")
          .withArgs(id, executer.address, 1);
      });

      it("Should emit ProposalProcessed event with ProposalState.Canceled", async () => {
        const {
          contracts: { governance },
          users: { user1, user2, executer },
        } = await loadFixture(deploy);

        const executerSigher = governance.connect(executer);
        const user1Sigher = governance.connect(user1);
        const user2Sigher = governance.connect(user2);

        await user1Sigher.createProposal(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        const id = await user1Sigher.createProposal.staticCall(
          ...encodeParameters(["setX"], [1000], "Set X to 1000"),
        );

        await mine(101, { interval: 0 });

        await user2Sigher.voteForProposal(id, false);

        await mine(101, { interval: 0 });

        const processTx = await executerSigher.processProposal(id);

        await expect(processTx)
          .to.emit(governance, "ProposalProcessed")
          .withArgs(id, executer.address, 2);
      });
    });
  });
});
