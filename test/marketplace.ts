/* eslint-disable no-unused-expressions */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  Marketplace__factory,
  MyERC721__factory,
  WETH__factory,
} from "../typechain-types";

const img1 =
  "https://cdn.wcs.org/2022/05/23/2ibwo5nyey_76768945_200ee080_6772_11ea_99f1_23346ee95a58.jpg";
const img2 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpz6-_dGtrY6kDdHfCsBb6K6uokCkXmp4YoA&s";
const img3 =
  "https://cdn.wcs.org/2022/05/23/8ejzemcnfp_Julie_Larsen_Maher_0514_American_Alligator_WOR_BZ_10_27_11_hr.jpg";
const img4 =
  "https://cdn.wcs.org/2022/05/23/6bl5tpj3t0_Julie_Larsen_Maher_0014_King_Penguins_PNP_CPZ_11_29_10_hr.jpg";
const img5 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWOjrZlpmiRw_qohp0hHrA593OeZJwtV6fYw&s";

enum OrderType {
  SELL,
  BUY,
}

enum OrderStatus {
  Created,
  Processed,
  Canceled,
}

describe("Governance", () => {
  const deploy = async () => {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();

    const weth = await new WETH__factory(owner).deploy();
    const nft = await new MyERC721__factory(owner).deploy();
    const marketplace = await new Marketplace__factory(owner).deploy();

    await marketplace.initialize(
      await nft.getAddress(),
      await weth.getAddress(),
    );

    const user1Nft = nft.connect(user1);
    const user2Nft = nft.connect(user2);
    const user3Nft = nft.connect(user3);
    const user4Nft = nft.connect(user4);

    const user1Weth = weth.connect(user1);
    const user2Weth = weth.connect(user2);
    const user3Weth = weth.connect(user3);
    const user4Weth = weth.connect(user4);

    await user1Nft.createNFT(img1);
    await user1Nft.createNFT(img2);
    await user2Nft.createNFT(img3);
    await user2Nft.createNFT(img4);
    await user3Nft.createNFT(img5);

    await Promise.all([
      user1Weth.deposit({ value: ethers.parseEther("100") }),
      user2Weth.deposit({ value: ethers.parseEther("100") }),
      user3Weth.deposit({ value: ethers.parseEther("100") }),
      user4Weth.deposit({ value: ethers.parseEther("100") }),
    ]);

    return {
      contracts: { weth, nft, marketplace },
      users: { owner, user1, user2, user3, user4 },
      signers: {
        weth: {
          user1Weth,
          user2Weth,
          user3Weth,
          user4Weth,
        },
        nft: {
          user1Nft,
          user2Nft,
          user3Nft,
          user4Nft,
        },
        marketplace: {
          user1Marketplace: marketplace.connect(user1),
          user2Marketplace: marketplace.connect(user2),
          user3Marketplace: marketplace.connect(user3),
          user4Marketplace: marketplace.connect(user4),
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
        contracts: { weth, nft },
        users: { user1, user2, user3, user4 },
      } = fixture;

      expect(await weth.balanceOf(user1.address)).to.equal(
        ethers.parseEther("100"),
      );
      expect(await weth.balanceOf(user2.address)).to.equal(
        ethers.parseEther("100"),
      );
      expect(await weth.balanceOf(user3.address)).to.equal(
        ethers.parseEther("100"),
      );
      expect(await weth.balanceOf(user4.address)).to.equal(
        ethers.parseEther("100"),
      );

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.ownerOf(1)).to.equal(user1.address);
      expect(await nft.ownerOf(2)).to.equal(user2.address);
      expect(await nft.ownerOf(3)).to.equal(user2.address);
      expect(await nft.ownerOf(4)).to.equal(user3.address);
    });
  });

  describe("Marketplace", () => {
    describe("Basic", async () => {
      it("Should create a sell order", async () => {
        const {
          contracts: { marketplace },
          users: { user1 },
          signers: {
            marketplace: { user1Marketplace },
          },
        } = fixture;

        await user1Marketplace.createOrder(1000, 0, OrderType.SELL);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await user1Marketplace.getOrder(ids[0]))[0]).to.equal(
          user1.address,
        );
      });

      it("Should create a buy order", async () => {
        const {
          contracts: { marketplace },
          users: { user2 },
          signers: {
            marketplace: { user2Marketplace },
          },
        } = fixture;

        await user2Marketplace.createOrder(1000, 2, OrderType.BUY);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await user2Marketplace.getOrder(ids[0]))[0]).to.equal(
          user2.address,
        );
      });

      it("Should a buy and sell order for the same nft", async () => {
        const {
          contracts: { marketplace },
          users: { user1, user2 },
          signers: {
            marketplace: { user1Marketplace, user2Marketplace },
          },
        } = fixture;

        await user1Marketplace.createOrder(1000, 0, OrderType.SELL);
        await user2Marketplace.createOrder(1000, 0, OrderType.BUY);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await user1Marketplace.getOrder(ids[0]))[0]).to.equal(
          user1.address,
        );
        expect((await user2Marketplace.getOrder(ids[1]))[0]).to.equal(
          user2.address,
        );
      });

      it("Should process multiple sell orders from one user", async () => {
        const {
          contracts: { marketplace },
          users: { user1 },
          signers: {
            marketplace: { user1Marketplace },
          },
        } = fixture;

        await user1Marketplace.createOrder(1000, 0, OrderType.SELL);
        await user1Marketplace.createOrder(1000, 1, OrderType.SELL);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await user1Marketplace.getOrder(ids[0]))[0]).to.equal(
          user1.address,
        );
        expect((await user1Marketplace.getOrder(ids[1]))[0]).to.equal(
          user1.address,
        );
      });

      it("Should process multiple sell and buy orders", async () => {
        const {
          contracts: { marketplace },
          users: { user1, user2 },
          signers: {
            marketplace: { user1Marketplace, user2Marketplace },
          },
        } = fixture;

        await user1Marketplace.createOrder(1000, 0, OrderType.SELL);
        await user1Marketplace.createOrder(1000, 1, OrderType.SELL);
        await user2Marketplace.createOrder(1000, 2, OrderType.BUY);
        await user2Marketplace.createOrder(1000, 3, OrderType.BUY);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await user1Marketplace.getOrder(ids[0]))[0]).to.equal(
          user1.address,
        );
        expect((await user1Marketplace.getOrder(ids[1]))[0]).to.equal(
          user1.address,
        );
        expect((await user2Marketplace.getOrder(ids[2]))[0]).to.equal(
          user2.address,
        );
        expect((await user2Marketplace.getOrder(ids[3]))[0]).to.equal(
          user2.address,
        );
      });

      // it("Should fail to create orders for the same nft ", async () => {
      //   const {
      //     signers: {
      //       marketplace: { user1Marketplace },
      //     },
      //   } = fixture;

      //   await user1Marketplace.createOrder(1000, 0, OrderType.SELL);
      //   expect(user1Marketplace.createOrder(1000, 0, OrderType.SELL)).to.be
      //     .reverted;
      // });
    });

    describe("Processes", async () => {
      it("Should process a sell order", async () => {
        const {
          contracts: { marketplace, nft, weth },
          users: { user1, user2 },
          signers: {
            marketplace: { user1Marketplace, user2Marketplace },
            weth: { user2Weth },
            nft: { user1Nft },
          },
        } = fixture;

        await user1Marketplace.createOrder(1000, 0, OrderType.SELL);
        await user2Marketplace.createOrder(1000, 0, OrderType.BUY);

        const ids = (
          await marketplace.queryFilter(
            marketplace.filters["OrderCreated(bytes32,address,uint8)"](),
          )
        ).map(({ args }) => args.id);

        expect((await marketplace.getOrder(ids[0]))[0]).to.equal(user1.address);
        expect((await marketplace.getOrder(ids[1]))[0]).to.equal(user2.address);

        await user2Weth.approve(await marketplace.getAddress(), 2000000);
        await user1Nft.approve(await marketplace.getAddress(), 0);

        expect(await nft.ownerOf(0)).to.equal(user1.address);
        await user1Marketplace.processOrder(ids[0], ids[1]);
        expect(await nft.ownerOf(0)).to.equal(user2.address);

        expect(await weth.balanceOf(user1.address)).to.changeTokenBalance(
          weth,
          user1,
          2000000,
        );
        expect(await weth.balanceOf(user2.address)).to.changeTokenBalance(
          weth,
          user2,
          -2000000,
        );

        expect((await marketplace.getOrder(ids[0]))[5]).to.equal(
          OrderStatus.Processed,
        );
        expect((await marketplace.getOrder(ids[0]))[5]).to.equal(
          OrderStatus.Processed,
        );
      });
    });
  });
});
