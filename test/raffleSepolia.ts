// import {
//   loadFixture,
//   time,
// } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";
// import { ethers } from "hardhat";

// import { MyProxy__factory, RaffleExtended__factory } from "../typechain-types";

// // 0x779877a7b0d9e8603169ddbd7836e478b4624789
// // 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
// // 0x7b79995e5f793a07bc00c21412e50ecae098e7f9

// describe("Raffle", () => {
//   const deploy = async () => {
//     const [owner, accountAsd1, accountUsdt, accountUsdc, accountLink] =
//       await ethers.getSigners();

//     const uniswapV2Router = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

//     const weth = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
//     const usdt = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";
//     const usdc = "0xf08A50178dfcDe18524640EA6618a1f965821715";
//     const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

//     const wethContract = await ethers.getContractAt("IWETH", weth);
//     const usdtContract = await ethers.getContractAt("BaseERC20", usdt);
//     const usdcContract = await ethers.getContractAt("ERC20Permit", usdc);
//     const linkContract = await ethers.getContractAt("BaseERC20", link);

//     const wethHolder = "0x0d2bC7805a502c6fe804f975647CdC24024A2EA6";
//     const usdtHolder = "0xdD5De55eA6804EFb283f43b0C091C25000a6486c";
//     const usdcHolder = "0xb78Df6beE4A08EbdE422E2f9C6DA2F9F740D6292";
//     const linkHolder = "0x61E5E1ea8fF9Dc840e0A549c752FA7BDe9224e99";

//     const wethUser = await ethers.getImpersonatedSigner(wethHolder);
//     const usdtUser = await ethers.getImpersonatedSigner(usdtHolder);
//     const usdcUser = await ethers.getImpersonatedSigner(usdcHolder);
//     const linkUser = await ethers.getImpersonatedSigner(linkHolder);

//     const sendETH = async (recipient: string, amount: bigint) => {
//       const transaction = {
//         to: recipient,
//         value: amount,
//       };

//       const tx = await owner.sendTransaction(transaction);
//       return tx;
//     };

//     await sendETH(await wethUser.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await usdtUser.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await usdcUser.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await linkUser.getAddress(), ethers.parseEther("1000"));

//     await wethContract
//       .connect(wethUser)
//       .transfer(accountAsd1.address, 100000000000000n);
//     await usdtContract.connect(usdtUser).transfer(accountUsdt.address, 10000n);
//     await usdcContract.connect(usdcUser).transfer(accountUsdc.address, 10000n);
//     await linkContract
//       .connect(linkUser)
//       .transfer(accountLink.address, 100000000000000n);

//     const whitelist = [weth, usdt, usdc, link];

//     const _contract = await new RaffleExtended__factory(owner).deploy();

//     const _proxyContract = await new MyProxy__factory(owner).deploy({
//       maxFeePerGas: 90935401183,
//     });

//     await _proxyContract.setImplementation(await _contract.getAddress());

//     const proxyContract = await ethers.getContractAt(
//       "RaffleExtended",
//       await _proxyContract.getAddress(),
//     );

//     await proxyContract.initialize(
//       whitelist,
//       uniswapV2Router,
//       0n,
//       ethers.randomBytes(32),
//       owner.address,
//     );

//     return {
//       contract: proxyContract,
//       wethContract,
//       usdtContract,
//       usdcContract,
//       linkContract,
//       accountAsd1,
//       accountUsdt,
//       accountUsdc,
//       accountLink,
//     };
//   };

//   describe("Deployment", () => {
//     it("Should deploy the contract", async () => {
//       const { contract } = await loadFixture(deploy);
//       // eslint-disable-next-line no-unused-expressions
//       expect(contract).to.exist;
//     });
//   });

//   describe("Raffle", () => {
//     describe("Basic deposits", () => {
//       it("Should deposit once", async () => {
//         const { contract, usdcContract, accountUsdc, wethContract } =
//           await loadFixture(deploy);

//         const usdcSigner = contract.connect(accountUsdc);

//         await usdcContract
//           .connect(accountUsdc)
//           .approve(await contract.getAddress(), 1000n);

//         await usdcSigner.deposit(1000n, 2);

//         expect(await contract.pool()).to.equal(
//           await wethContract.balanceOf(await contract.getAddress()),
//         );
//       });

//       it("Should deposit twice", async () => {
//         const {
//           contract,
//           usdcContract,
//           accountUsdc,
//           usdtContract,
//           accountUsdt,
//           wethContract: asd1Contract,
//         } = await loadFixture(deploy);
//         const usdcSigner = contract.connect(accountUsdc);
//         const usdtSigner = contract.connect(accountUsdt);

//         await usdcContract
//           .connect(accountUsdc)
//           .approve(contract.getAddress(), 1000n);
//         await usdtContract
//           .connect(accountUsdt)
//           .approve(contract.getAddress(), 1000n);

//         await usdcSigner.deposit(1000n, 2);
//         await usdtSigner.deposit(1000n, 1);

//         expect(await contract.pool()).to.equal(
//           await asd1Contract.balanceOf(await contract.getAddress()),
//         );
//       });

//       it("Should deposit link", async () => {
//         const { contract, linkContract, accountLink, wethContract } =
//           await loadFixture(deploy);
//         const linkSigner = contract.connect(accountLink);
//         await linkContract
//           .connect(accountLink)
//           .approve(contract.getAddress(), 100000000000000n);
//         await linkSigner.deposit(100000000000000n, 3);

//         expect(await contract.pool()).to.equal(
//           await wethContract.balanceOf(await contract.getAddress()),
//         );
//       });

//       it("Should deposit weth", async () => {
//         const { contract, wethContract, accountAsd1 } =
//           await loadFixture(deploy);
//         const asd1Signer = contract.connect(accountAsd1);

//         await wethContract
//           .connect(accountAsd1)
//           .approve(contract.getAddress(), 100000000000000n);

//         await asd1Signer.deposit(100000000000000n, 0);
//         expect(await contract.pool()).to.be.greaterThan(0n);
//       });
//     });

//     describe("Wins", () => {
//       it("Should win when first", async () => {
//         const {
//           contract,
//           usdcContract,
//           accountUsdc,
//           usdtContract,
//           accountUsdt,
//           wethContract: asd1Contract,
//         } = await loadFixture(deploy);
//         const usdcSigner = contract.connect(accountUsdc);
//         const usdtSigner = contract.connect(accountUsdt);
//         await usdtContract
//           .connect(accountUsdt)
//           .approve(contract.getAddress(), 2000n);
//         await usdcContract
//           .connect(accountUsdc)
//           .approve(contract.getAddress(), 1000n);
//         await usdtSigner.deposit(2000n, 1);
//         await usdcSigner.deposit(1000n, 2);
//         const resp = (
//           await contract.queryFilter(contract.filters.Deposited())
//         ).map(({ args }) => {
//           return {
//             id: args.id,
//             deposit: args.deposit,
//           };
//         });

//         const prePool = await contract.pool();
//         const preBalance = await asd1Contract.balanceOf(accountUsdt.address);

//         await time.increase(60 * 60);

//         await contract.rawFulfillRandomWords(0n, [500n]);
//         await contract.withdraw(resp[0].id, resp[1].id);

//         expect(await contract.pool()).to.equal(0n);
//         expect(await asd1Contract.balanceOf(accountUsdt.address)).to.equal(
//           preBalance + prePool,
//         );
//       });

//       it("Should win when second", async () => {
//         const {
//           contract,
//           usdcContract,
//           accountUsdc,
//           usdtContract,
//           accountUsdt,
//           wethContract: asd1Contract,
//         } = await loadFixture(deploy);
//         const usdcSigner = contract.connect(accountUsdc);
//         const usdtSigner = contract.connect(accountUsdt);
//         await usdtContract
//           .connect(accountUsdt)
//           .approve(contract.getAddress(), 1000n);
//         await usdcContract
//           .connect(accountUsdc)
//           .approve(contract.getAddress(), 2000n);

//         await usdtSigner.deposit(1000n, 1);
//         await usdcSigner.deposit(2000n, 2);

//         const resp = (
//           await contract.queryFilter(contract.filters.Deposited())
//         ).map(({ args }) => {
//           return {
//             id: args.id,
//             deposit: args.deposit,
//           };
//         });

//         const prePool = await contract.pool();
//         const preBalance = await asd1Contract.balanceOf(accountUsdc.address);

//         await time.increase(60 * 60);

//         await contract.rawFulfillRandomWords(0n, [434759744970n]);
//         await contract.withdraw(resp[1].id, resp[1].id);

//         expect(await contract.pool()).to.equal(0n);
//         expect(await asd1Contract.balanceOf(accountUsdc.address)).to.equal(
//           preBalance + prePool,
//         );
//       });
//     });

//     it("Should permit", async () => {
//       const { contract, usdcContract, accountUsdc, wethContract } =
//         await loadFixture(deploy);

//       const usdcSigner = contract.connect(accountUsdc);

//       const chainId = 31337;
//       const tokenName = await usdcContract.name();
//       const version = "2";
//       const nonce = await usdcContract.nonces(await contract.getAddress());
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
//       const domain = {
//         name: tokenName,
//         version,
//         chainId,
//         verifyingContract: await usdcContract.getAddress(),
//       };

//       const types = {
//         Permit: [
//           { name: "owner", type: "address" },
//           { name: "spender", type: "address" },
//           { name: "value", type: "uint256" },
//           { name: "nonce", type: "uint256" },
//           { name: "deadline", type: "uint256" },
//         ],
//       };

//       const message = {
//         owner: accountUsdc.address,
//         spender: await contract.getAddress(),
//         value: "1000",
//         nonce,
//         deadline,
//       };

//       try {
//         const signature = await accountUsdc.signTypedData(
//           domain,
//           types,
//           message,
//         );

//         const { r, s, v } = ethers.Signature.from(signature);

//         await usdcSigner.permitDeposit(1000n, 2, deadline, r, s, v);
//       } catch (error) {
//         console.error("Error signing permit:", error);
//       }
//       expect(await contract.pool()).to.equal(
//         await wethContract.balanceOf(await contract.getAddress()),
//       );
//     });
//   });
// });
