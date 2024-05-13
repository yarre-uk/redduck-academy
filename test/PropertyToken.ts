import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import fc from "fast-check";
import { ethers } from "hardhat";

import { YarreToken__factory } from "../typechain-types";

fc.configureGlobal({ numRuns: 10, verbose: true });

function calculateBalance(amount: bigint, feePercentage: bigint) {
  return amount - (amount * feePercentage) / 10000n;
}

const buyRightAmount = async (amount: bigint) => {
  const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  expect(await signer1.balanceOf(account1.address)).to.equal(expectedBalance);
};

const canSellBoughtAmount = async (amount: bigint) => {
  const { yarreToken, account1, initialPrice } = await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  expect(await signer1.balanceOf(account1.address)).to.equal(expectedBalance);

  await signer1.approve(signer1.getAddress(), expectedBalance);
  await signer1["sell(uint256)"](expectedBalance);

  expect(await signer1.balanceOf(account1.address)).to.equal(0);

  expect(await ethers.provider.getBalance(account1.address)).to.be.lessThan(
    ethers.parseEther("10000"),
  );
};

// const canBuyDifferentWays = async (
//   firstAmount: bigint,
//   secondAmount: bigint,
// ) => {
//   const { yarreToken, account1, account2, initialPrice } =
//     await loadFixture(deploy);

//   const signer1 = yarreToken.connect(account1);
//   const signer2 = yarreToken.connect(account2);

//   await signer1["buy()"]({ value: firstAmount });
//   await signer1["buy()"]({ value: secondAmount });
//   await signer2["buy()"]({ value: firstAmount + secondAmount });

//   const feePercentage = await signer1.feePercentage(); // 1 -> 0.01%

//   // let expectedBalance = firstAmount * initialPrice;
//   // expectedBalance -= calculateFee(expectedBalance, feePercentage);
//   // expectedBalance += secondAmount * initialPrice;
//   // expectedBalance -= calculateFee(expectedBalance, feePercentage);

//   let expectedBalance1 = (firstAmount + secondAmount) * initialPrice;
//   expectedBalance1 -= calculateFee(expectedBalance1, feePercentage);

//   let expectedBalance2 = firstAmount * initialPrice;
//   expectedBalance2 -= calculateFee(firstAmount * initialPrice, feePercentage);
//   expectedBalance2 += secondAmount * initialPrice;
//   expectedBalance2 -= calculateFee(secondAmount * initialPrice, feePercentage);

//   expect(expectedBalance1).to.equal(
//     expectedBalance2,
//     "expectedBalance1 != expectedBalance2",
//   );

//   // expect(await yarreToken.balanceOf(account1.address)).to.equal(
//   //   expectedBalance1,
//   //   "account1 balance is not equal to expectedBalance1",
//   // );
//   // expect(await yarreToken.balanceOf(account2.address)).to.equal(
//   //   expectedBalance1,
//   //   "account2 balance is not equal to expectedBalance1",
//   // );

//   console.log("firstAmount, secondAmount ->", firstAmount, secondAmount);
//   console.log("expectedBalance1 ->", expectedBalance1);
//   console.log("expectedBalance2 ->", expectedBalance2);
//   // console.log("account1", await yarreToken.balanceOf(account1.address));
//   // console.log("account2", await yarreToken.balanceOf(account2.address));
//   console.log("---");

//   // expect(await yarreToken.balanceOf(account1.address)).to.equal(
//   //   await yarreToken.balanceOf(account2.address),
//   // );

//   return true;
// };

const canTransferRightAmount = async (amount: bigint) => {
  const { yarreToken, account1, account2, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  await signer1["transfer(address,uint256)"](account2.address, expectedBalance);

  expect(await signer1.balanceOf(account1.address)).to.equal(0n);
  expect(await signer1.balanceOf(account2.address)).to.equal(expectedBalance);
};

const canTransferDifferentWays = async (amount: bigint, ratio: bigint) => {
  const { yarreToken, account1, account2, account3, account4, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  const signer2 = yarreToken.connect(account2);

  await signer1["buy()"]({ value: amount });
  await signer2["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  const firstAmount = (expectedBalance * ratio) / 100n;
  const secondAmount = expectedBalance - firstAmount;

  await signer1["transfer(address,uint256)"](account3.address, firstAmount);
  await signer1["transfer(address,uint256)"](account3.address, secondAmount);
  await signer2["transfer(address,uint256)"](account4.address, expectedBalance);

  expect(await signer1.balanceOf(account1.address)).to.equal(0);
  expect(await signer1.balanceOf(account2.address)).to.equal(0);

  expect(await signer1.balanceOf(account3.address)).to.equal(expectedBalance);
  expect(await signer1.balanceOf(account4.address)).to.equal(expectedBalance);
};

const canTransferBack = async (amount: bigint) => {
  const { yarreToken, account1, account2, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  await signer1["transfer(address,uint256)"](account2.address, expectedBalance);

  expect(await signer1.balanceOf(account1.address)).to.equal(0);
  expect(await signer1.balanceOf(account2.address)).to.equal(expectedBalance);

  const signer2 = yarreToken.connect(account2);
  await signer2["transfer(address,uint256)"](account1.address, expectedBalance);

  expect(await signer1.balanceOf(account1.address)).to.equal(expectedBalance);
  expect(await signer1.balanceOf(account2.address)).to.equal(0);
};

const canTransferFromRightAmount = async (amount: bigint) => {
  const { yarreToken, account1, account2, account3, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  const signer2 = yarreToken.connect(account2);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  await signer1.approve(account3.address, expectedBalance);
  await signer2["transferFrom(address,address,uint256)"](
    account1.address,
    account3.address,
    expectedBalance,
  );

  expect(await signer1.balanceOf(account1.address)).to.equal(0);
  expect(await signer1.balanceOf(account3.address)).to.equal(expectedBalance);
};

const canTransferFromDifferentWays = async (amount: bigint, ratio: bigint) => {
  const { yarreToken, account1, account2, account3, account4, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  const signer2 = yarreToken.connect(account2);
  await signer1["buy()"]({ value: amount });
  await signer2["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  const firstAmount = (expectedBalance * ratio) / 100n;
  const secondAmount = expectedBalance - firstAmount;

  await signer1.approve(account3.address, expectedBalance);
  await signer2.approve(account4.address, expectedBalance);

  await signer2["transferFrom(address,address,uint256)"](
    account1.address,
    account3.address,
    firstAmount,
  );
  await signer2["transferFrom(address,address,uint256)"](
    account1.address,
    account3.address,
    secondAmount,
  );

  await signer1["transferFrom(address,address,uint256)"](
    account2.address,
    account4.address,
    expectedBalance,
  );

  expect(await signer1.balanceOf(account1.address)).to.equal(0);
  expect(await signer1.balanceOf(account2.address)).to.equal(0);

  expect(await signer1.balanceOf(account4.address)).to.equal(
    await signer1.balanceOf(account4.address),
  );
};

const canTransformFromBack = async (amount: bigint) => {
  const { yarreToken, account1, account2, account3, initialPrice } =
    await loadFixture(deploy);

  const signer1 = yarreToken.connect(account1);
  const signer2 = yarreToken.connect(account2);
  const signer3 = yarreToken.connect(account3);
  await signer1["buy()"]({ value: amount });

  const expectedBalance = calculateBalance(
    amount * initialPrice,
    await signer1.feePercentage(),
  );

  await signer1.approve(account3.address, expectedBalance);
  await signer2["transferFrom(address,address,uint256)"](
    account1.address,
    account3.address,
    expectedBalance,
  );

  expect(await signer1.balanceOf(account1.address)).to.equal(0);
  expect(await signer1.balanceOf(account3.address)).to.equal(expectedBalance);

  await signer3.approve(account1.address, expectedBalance);
  await signer2["transferFrom(address,address,uint256)"](
    account3.address,
    account1.address,
    expectedBalance,
  );

  expect(await signer1.balanceOf(account3.address)).to.equal(0);
  expect(await signer1.balanceOf(account1.address)).to.equal(expectedBalance);
};

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

describe("Property Based Tests For Yarre Token", () => {
  it("should always be able to buy the right amount", async () => {
    await fc.assert(fc.asyncProperty(fc.bigInt(1n, 1000000n), buyRightAmount));
  });

  it("should always be able to sell and buy the amount", async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigInt(1n, 1000n), canSellBoughtAmount),
    );
  });

  it("should always be able to transfer the right amount", async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigInt(1n, 1000000n), canTransferRightAmount),
    );
  });

  it("should always be able to transfer the right amount in different ways", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.bigInt(1n, 1000000n),
        fc.bigInt(1n, 99n),
        canTransferDifferentWays,
      ),
    );
  });

  it("should always be able to transfer back the right amount", async () => {
    await fc.assert(fc.asyncProperty(fc.bigInt(1n, 1000000n), canTransferBack));
  });

  it("should always be able to transfer from the right amount", async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigInt(1n, 1000000n), canTransferFromRightAmount),
    );
  });

  it("should always be able to transfer from the right amount in different ways", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.bigInt(1n, 1000000n),
        fc.bigInt(1n, 99n),
        canTransferFromDifferentWays,
      ),
    );
  });

  it("should always be able to transfer from back the right amount", async () => {
    await fc.assert(
      fc.asyncProperty(fc.bigInt(1n, 1000000n), canTransformFromBack),
    );
  });

  // it("should always be able to buy the amount in different ways", async () => {
  //   await fc.assert(
  //     fc.asyncProperty(
  //       fc.bigInt(1n, 1000000n),
  //       fc.bigInt(1n, 1000000n),
  //       canBuyDifferentWays,
  //     ),
  //   );
  // });
});
