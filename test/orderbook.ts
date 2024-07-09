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
  BUY,
  SELL,
}

const TOKEN_ID = 0n;
const EMPTY_BYTES = "0x" + "0".repeat(64);

describe("Orderbook", () => {
  type Contracts = {
    ecrContract: MyERC1155;
    orderbook: Orderbook;
  };

  type Users = Record<string, HardhatEthersSigner>;

  type Signers = {
    [K in keyof Contracts]: Record<string, Contracts[K]>;
  };

  const deploy = async () => {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();

    const ecrContract = await new MyERC1155__factory(owner).deploy();
    const orderbook = await new Orderbook__factory(owner).deploy();

    await Promise.all([
      ecrContract.mint(user1.address, 0n, ethers.parseEther("1"), EMPTY_BYTES),
      ecrContract.mint(user2.address, 0n, ethers.parseEther("1"), EMPTY_BYTES),
      ecrContract.mint(user3.address, 0n, ethers.parseEther("1"), EMPTY_BYTES),
      ecrContract.mint(user4.address, 0n, ethers.parseEther("1"), EMPTY_BYTES),
    ]);

    await orderbook.initialize(await ecrContract.getAddress(), [TOKEN_ID]);

    return {
      contracts: { ecrContract, orderbook } satisfies Contracts,
      users: { owner, user1, user2, user3, user4 } satisfies Users,
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
      } satisfies Signers,
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

  describe("Orderbook", () => {
    it("Should add buy order", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook },
        },
      } = fixture;

      const price = 1000n;
      const amount = 100n;

      const id = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price * amount },
      );

      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price * amount },
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id))[0],
      ).to.be.equal(price);
    });

    it("Should add sell order", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook },
          ecrContract: { user1EcrContract },
        },
      } = fixture;

      const price = 1000n;
      const amount = 100n;

      await user1EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      const id = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.SELL, id))[0],
      ).to.be.equal(price);
    });

    it("Should create sell order a = b", async () => {
      const {
        contracts: { orderbook, ecrContract },
        users: { user1, user2 },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook },
          ecrContract: { user1EcrContract },
        },
      } = fixture;

      const price = 1000n;
      const amount = 100n;

      await user1EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price * amount },
      );

      const initialBalance = await ecrContract.balanceOf(
        user1.address,
        TOKEN_ID,
      );

      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      expect(await ecrContract.balanceOf(user1.address, TOKEN_ID)).to.be.equal(
        initialBalance - amount,
      );
      expect(await ecrContract.balanceOf(user2.address, TOKEN_ID)).to.be.equal(
        initialBalance + amount,
      );
    });

    it("Should create sell order a < b", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook, user3Orderbook },
          ecrContract: { user3EcrContract },
        },
      } = fixture;

      const price1 = 1000n;
      const price2 = 2000n;
      const price3 = 1500n;
      const amount = 100n;

      await user3EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      const id1 = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );
      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );

      const id2 = await user2Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price2,
        amount,
        OrderType.BUY,
        id1,
        { value: price2 * amount },
      );
      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price2,
        amount,
        OrderType.BUY,
        id1,
        { value: price2 * amount },
      );

      const id3 = await user3Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price3,
        amount * 2n,
        OrderType.SELL,
        EMPTY_BYTES,
      );
      await user3Orderbook.createPassiveOrder(
        TOKEN_ID,
        price3,
        amount * 2n,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id1))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id2))[1],
      ).to.be.equal(0);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.SELL, id3))[1],
      ).to.be.equal(amount);
    });

    it("Should create sell order a > b", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook, user3Orderbook },
          ecrContract: { user3EcrContract },
        },
      } = fixture;

      const price1 = 1000n;
      const price2 = 2000n;
      const price3 = 1500n;
      const amount = 100n;

      await user3EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      const id1 = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );
      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );

      const id2 = await user2Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price2,
        amount * 2n,
        OrderType.BUY,
        id1,
        { value: price2 * amount * 2n },
      );
      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price2,
        amount * 2n,
        OrderType.BUY,
        id1,
        { value: price2 * amount * 2n },
      );

      const id3 = await user3Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price3,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );
      await user3Orderbook.createPassiveOrder(
        TOKEN_ID,
        price3,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id1))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id2))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.SELL, id3))[1],
      ).to.be.equal(0);
    });

    it("Should create buy order a = b", async () => {
      const {
        contracts: { orderbook, ecrContract },
        users: { user1, user2 },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook },
          ecrContract: { user1EcrContract },
        },
      } = fixture;

      const price = 1000n;
      const amount = 100n;

      await user1EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      const initialBalance = await ecrContract.balanceOf(
        user1.address,
        TOKEN_ID,
      );

      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price * amount },
      );

      expect(await ecrContract.balanceOf(user1.address, TOKEN_ID)).to.be.equal(
        initialBalance - amount,
      );
      expect(await ecrContract.balanceOf(user2.address, TOKEN_ID)).to.be.equal(
        initialBalance + amount,
      );
    });

    it("Should create buy order a < b", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook, user3Orderbook },
          ecrContract: { user3EcrContract },
        },
      } = fixture;

      const price1 = 1000n;
      const price2 = 2000n;
      const price3 = 1500n;
      const amount = 100n;

      await user3EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      const id1 = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );
      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );

      const id3 = await user3Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price3,
        amount * 2n,
        OrderType.SELL,
        EMPTY_BYTES,
      );
      await user3Orderbook.createPassiveOrder(
        TOKEN_ID,
        price3,
        amount * 2n,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      const id2 = await user2Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price2,
        amount,
        OrderType.BUY,
        id1,
        { value: price2 * amount },
      );
      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price2,
        amount,
        OrderType.BUY,
        id1,
        { value: price2 * amount },
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id1))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id2))[1],
      ).to.be.equal(0);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.SELL, id3))[1],
      ).to.be.equal(amount);
    });

    it("Should create buy order a > b", async () => {
      const {
        contracts: { orderbook },
        signers: {
          orderbook: { user1Orderbook, user2Orderbook, user3Orderbook },
          ecrContract: { user3EcrContract },
        },
      } = fixture;

      const price1 = 1000n;
      const price2 = 2000n;
      const price3 = 1500n;
      const amount = 100n;

      await user3EcrContract.setApprovalForAll(
        await orderbook.getAddress(),
        true,
      );

      const id1 = await user1Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );
      await user1Orderbook.createPassiveOrder(
        TOKEN_ID,
        price1,
        amount,
        OrderType.BUY,
        EMPTY_BYTES,
        { value: price1 * amount },
      );

      const id3 = await user3Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price3,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );
      await user3Orderbook.createPassiveOrder(
        TOKEN_ID,
        price3,
        amount,
        OrderType.SELL,
        EMPTY_BYTES,
      );

      const id2 = await user2Orderbook.createPassiveOrder.staticCall(
        TOKEN_ID,
        price2,
        amount * 2n,
        OrderType.BUY,
        id1,
        { value: price2 * amount * 2n },
      );
      await user2Orderbook.createPassiveOrder(
        TOKEN_ID,
        price2,
        amount * 2n,
        OrderType.BUY,
        id1,
        { value: price2 * amount * 2n },
      );

      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id1))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.BUY, id2))[1],
      ).to.be.equal(amount);
      expect(
        (await orderbook.getOrder(TOKEN_ID, OrderType.SELL, id3))[1],
      ).to.be.equal(0);
    });
  });
});
