import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ignition, ethers } from "hardhat";

import { YarreToken__factory } from "../typechain-types";

describe("YarreToken", async () => {
  async function deploy() {
    const [owner, firstAcc, secondAcc] = await ethers.getSigners();
    const initialSupply = ethers.parseEther("10000");
    const initialPrice = ethers.parseEther("1000");

    const yarToken = await new YarreToken__factory(owner).deploy(
      initialSupply,
      initialPrice
    );

    expect(await yarToken.balanceOf(owner.address)).to.equal(
      ethers.parseEther("10000")
    );

    return {
      yarToken,
      owner,
      firstAcc,
      secondAcc,
      initialSupply,
      initialPrice,
    };
  }

  // describe("Deployment", async () => {
  //   it("Should set the right totalSupply", async () => {
  //     const { yarToken, initialSupply } = await loadFixture(deploy);

  //     expect(await yarToken.totalSupply()).to.equal(initialSupply);
  //   });

  //   it("Only owner should be able to access", async function () {
  //     const { yarToken } = await loadFixture(deploy);

  //     expect(await yarToken.getBalance()).to.equal(0);
  //   });

  //   it("Should fail because only owner may access", async function () {
  //     const { yarToken, firstAcc } = await loadFixture(deploy);

  //     await expect(yarToken.connect(firstAcc).getBalance()).to.be.rejectedWith(
  //       "Ownable: caller is not the owner"
  //     );
  //   });
  // });

  // describe("Buying and selling tokens", async () => {
  //   it("Should buy tokens", async () => {
  //     const { yarToken, firstAcc, initialPrice } = await loadFixture(deploy);

  //     const amount = ethers.parseEther("10");
  //     const firstSigner = yarToken.connect(firstAcc);
  //     await firstSigner.buy({ value: amount });

  //     const feePercentage = await firstSigner.feePercentage(); // 1 -> 0.01%
  //     let expectedBalance = amount * initialPrice;
  //     const fee = (expectedBalance * feePercentage) / BigInt(10000);
  //     expectedBalance -= fee;

  //     expect(await firstSigner.balanceOf(firstAcc.address)).to.equal(
  //       expectedBalance
  //     );
  //   });

  //   it("Should sell tokens", async () => {
  //     const { yarToken, firstAcc, initialPrice } = await loadFixture(deploy);

  //     const amount = ethers.parseEther("10");
  //     const firstSigner = yarToken.connect(firstAcc);
  //     await firstSigner.buy({ value: amount });

  //     const feePercentage = await firstSigner.feePercentage(); // 1 -> 0.01%
  //     let expectedBalance = amount * initialPrice;
  //     const fee = (expectedBalance * feePercentage) / BigInt(10000);
  //     expectedBalance -= fee;

  //     expect(await firstSigner.balanceOf(firstAcc.address)).to.equal(
  //       expectedBalance
  //     );

  //     await firstSigner.sell(expectedBalance);

  //     expect(await firstSigner.balanceOf(firstAcc.address)).to.equal(0);

  //     expect(await ethers.provider.getBalance(firstAcc.address)).to.be.lessThan(
  //       ethers.parseEther("10000")
  //     );
  //   });
  // });

  // describe("Transfer and withdraw", async () => {
  //   it("Should transfer tokens", async () => {
  //     const { yarToken, owner, firstAcc, initialSupply } = await loadFixture(
  //       deploy
  //     );

  //     const amount = ethers.parseEther("10");
  //     const firstSigner = yarToken.connect(firstAcc);

  //     await yarToken.transfer(firstAcc.address, amount);

  //     expect(await firstSigner.balanceOf(firstAcc.address)).to.equal(amount);
  //     expect(await yarToken.balanceOf(owner.address)).to.equal(
  //       initialSupply - amount
  //     );
  //   });

  //   it("Should approve tokens", async () => {
  //     const { yarToken, owner, firstAcc } = await loadFixture(deploy);

  //     const amount = ethers.parseEther("10");

  //     await yarToken.approve(firstAcc.address, amount);

  //     expect(
  //       await yarToken.allowance(owner.address, firstAcc.address)
  //     ).to.equal(amount);
  //   });

  //   it("Should transferFrom tokens", async () => {
  //     const { yarToken, owner, firstAcc, initialSupply, secondAcc } =
  //       await loadFixture(deploy);

  //     const amount = ethers.parseEther("10");
  //     const firstSigner = yarToken.connect(firstAcc);
  //     const secondSigner = yarToken.connect(secondAcc);

  //     await yarToken.approve(firstAcc.address, amount);
  //     await secondSigner.transferFrom(owner.address, firstAcc.address, amount);

  //     expect(await firstSigner.balanceOf(firstAcc.address)).to.equal(amount);
  //     expect(await yarToken.balanceOf(owner.address)).to.equal(
  //       initialSupply - amount
  //     );
  //   });
  // });

  describe("Voting", async () => {
    it("Make vote when 0.1%", async () => {
      const { yarToken, owner, firstAcc } = await loadFixture(deploy);

      const amount = ethers.parseEther("1");

      const firstSigner = yarToken.connect(firstAcc);
      firstSigner.buy({ value: amount });

      console.log(await firstSigner.userPersantage());
    });
  });

  // describe("Events", async () => {});
});
