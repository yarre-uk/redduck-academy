// import {
//   loadFixture,
//   time,
// } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";
// import { ethers } from "hardhat";

// import { MyProxy__factory, RaffleExtended__factory } from "../typechain-types";

// describe("Raffle", () => {
//   const deploy = async () => {
//     const [owner, accountAsd1, accountUsdt, accountUsdc, accountLink] =
//       await ethers.getSigners();

//     const uniswapV2Router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

//     const asd1 = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
//     const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
//     const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
//     const link = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

//     const asd1Contract = await ethers.getContractAt("IWETH", asd1);
//     const usdtContract = await ethers.getContractAt("BaseERC20", usdt);
//     const usdcContract = await ethers.getContractAt("ERC20Permit", usdc);
//     const linkContract = await ethers.getContractAt("BaseERC20", link);

//     const asd1Holder = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";
//     const usdtHolder = "0x4Ee7bBc295A090aD0F6db12fe7eE4dC8de896400";
//     const usdcHolder = "0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa";
//     const linkHolder = "0x0757e27AC1631beEB37eeD3270cc6301dD3D57D4";

//     const asd1User = await ethers.getImpersonatedSigner(asd1Holder);
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

//     await sendETH(await asd1User.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await usdtUser.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await usdcUser.getAddress(), ethers.parseEther("1000"));
//     await sendETH(await linkUser.getAddress(), ethers.parseEther("1000"));

//     await asd1Contract
//       .connect(asd1User)
//       .transfer(accountAsd1.address, 100000000000000n);
//     await usdtContract.connect(usdtUser).transfer(accountUsdt.address, 10000n);
//     await usdcContract.connect(usdcUser).transfer(accountUsdc.address, 10000n);
//     await linkContract
//       .connect(linkUser)
//       .transfer(accountLink.address, 100000000000000n);

//     const whitelist = [asd1, usdt, usdc, link];

//     const _contract = await new RaffleExtended__factory(owner).deploy();

//     const _proxyContract = await new MyProxy__factory(owner).deploy();

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
//       asd1Contract,
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
//         const { contract, usdcContract, accountUsdc, asd1Contract } =
//           await loadFixture(deploy);

//         const usdcSigner = contract.connect(accountUsdc);

//         await usdcContract
//           .connect(accountUsdc)
//           .approve(await contract.getAddress(), 1000n);

//         await usdcSigner.deposit(1000n, 2);

//         expect(await contract.pool()).to.equal(
//           await asd1Contract.balanceOf(await contract.getAddress()),
//         );
//       });

//       it("Should deposit twice", async () => {
//         const {
//           contract,
//           usdcContract,
//           accountUsdc,
//           usdtContract,
//           accountUsdt,
//           asd1Contract,
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
//         const { contract, linkContract, accountLink, asd1Contract } =
//           await loadFixture(deploy);
//         const linkSigner = contract.connect(accountLink);
//         await linkContract
//           .connect(accountLink)
//           .approve(contract.getAddress(), 100000000000000n);
//         await linkSigner.deposit(100000000000000n, 3);

//         expect(await contract.pool()).to.equal(
//           await asd1Contract.balanceOf(await contract.getAddress()),
//         );
//       });

//       it("Should deposit weth", async () => {
//         const { contract, asd1Contract, accountAsd1 } =
//           await loadFixture(deploy);
//         const asd1Signer = contract.connect(accountAsd1);

//         await asd1Contract
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
//           asd1Contract,
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
//           asd1Contract,
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
//       const { contract, usdcContract, accountUsdc, asd1Contract } =
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
//         await asd1Contract.balanceOf(await contract.getAddress()),
//       );
//     });
//   });
// });
