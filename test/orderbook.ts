import { type HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  type MyERC1155,
  MyERC1155__factory,
  type Orderbook,
  Orderbook__factory,
} from "../typechain-types";

enum OrderType {
  SELL,
  BUY,
}

describe("Orderbook", () => {
  type Contracts = {
    ecrContract: MyERC1155;
    orderbook: Orderbook;
  };

  type Users = Record<string, HardhatEthersSigner>;

  type Signers = {
    [K in keyof Contracts]: Record<string, Contracts[K]>;
  };

  const deploy = async (): Promise<{
    contracts: Contracts;
    users: Users;
    signers: Signers;
  }> => {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();

    const ecrContract = await new MyERC1155__factory(owner).deploy();
    const orderbook = await new Orderbook__factory(owner).deploy();

    await ecrContract.mint(user1.address, 0n, ethers.parseEther("1"), "0x");
    await ecrContract.mint(user2.address, 0n, ethers.parseEther("1"), "0x");
    await ecrContract.mint(user3.address, 0n, ethers.parseEther("1"), "0x");
    await ecrContract.mint(user4.address, 0n, ethers.parseEther("1"), "0x");

    return {
      contracts: { ecrContract, orderbook },
      users: { owner, user1, user2, user3, user4 },
      signers: {
        ecrContract: {
          user1EcrContract: ecrContract.connect(user1),
          user2EcrContract: ecrContract.connect(user2),
          user3EcrContract: ecrContract.connect(user3),
          user4EcrContract: ecrContract.connect(user4),
        },
        orderbook: {
          user1Orderbook: orderbook.connect(user1),
          user2Orderbook: orderbook.connect(user2),
          user3Orderbook: orderbook.connect(user3),
          user4Orderbook: orderbook.connect(user4),
        },
      },
    };
  };

  let fixture: Awaited<
    ReturnType<typeof loadFixture<ReturnType<typeof deploy>>>
  >;

  beforeEach(async () => {
    fixture = (await loadFixture(deploy)) as typeof fixture;
  });

  describe("Deployment", () => {
    it("Should deploy the contract", async () => {
      const {
        contracts: { ecrContract, orderbook },
        users: { owner, user1, user2, user3, user4 },
      } = fixture;

      expect(
        await ecrContract.balanceOfBatch(
          [user1.address, user2.address, user3.address, user4.address],
          [0n, 0n, 0n, 0n],
        ),
      ).to.be.deep.equal(new Array(4).fill(ethers.parseEther("1")));

      expect(await orderbook.owner()).to.be.equal(owner.address);
      expect(await ecrContract.owner()).to.be.equal(owner.address);
    });
  });

  describe("Orderbook", () => {});
});
