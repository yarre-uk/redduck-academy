import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { MyProxy__factory, RaffleExtended__factory } from "../typechain-types";

describe("Raffle", () => {
  const deploy = async () => {
    const [owner, accountAsd1, accountUsdt, accountUsdc, accountLink] =
      await ethers.getSigners();

    const uniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    const asd1 = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";
    const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const link = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

    const asd1Oracle = "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A";
    const usdtOracle = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D";
    const usdcOracle = "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6";
    const linkOracle = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c";

    const asd1Contract = await ethers.getContractAt("BaseERC20", asd1);
    const usdtContract = await ethers.getContractAt("BaseERC20", usdt);
    const usdcContract = await ethers.getContractAt("ERC20Permit", usdc);
    const linkContract = await ethers.getContractAt("BaseERC20", link);

    const asd1Holder = "0xD041AF244d15456AEdFaB358fa80D6e454f3bd27";
    const usdtHolder = "0x4Ee7bBc295A090aD0F6db12fe7eE4dC8de896400";
    const usdcHolder = "0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa";
    const linkHolder = "0x0757e27AC1631beEB37eeD3270cc6301dD3D57D4";

    const asd1User = await ethers.getImpersonatedSigner(asd1Holder);
    const usdtUser = await ethers.getImpersonatedSigner(usdtHolder);
    const usdcUser = await ethers.getImpersonatedSigner(usdcHolder);
    const linkUser = await ethers.getImpersonatedSigner(linkHolder);

    const sendETH = async (recipient: string, amount: bigint) => {
      const transaction = {
        to: recipient,
        value: amount,
      };

      const tx = await owner.sendTransaction(transaction);
      return tx;
    };

    await sendETH(await asd1User.getAddress(), ethers.parseEther("1000"));
    await sendETH(await usdtUser.getAddress(), ethers.parseEther("1000"));
    await sendETH(await usdcUser.getAddress(), ethers.parseEther("1000"));
    await sendETH(await linkUser.getAddress(), ethers.parseEther("1000"));

    await asd1Contract.connect(asd1User).transfer(accountAsd1.address, 10000n);
    await usdtContract.connect(usdtUser).transfer(accountUsdt.address, 10000n);
    await usdcContract.connect(usdcUser).transfer(accountUsdc.address, 10000n);
    await linkContract.connect(linkUser).transfer(accountLink.address, 10000n);

    const whitelist = [asd1, usdt, usdc, link];
    const aggregators = [asd1Oracle, usdtOracle, usdcOracle, linkOracle];

    const _contract = await new RaffleExtended__factory(owner).deploy();

    const _proxyContract = await new MyProxy__factory(owner).deploy(
      await _contract.getAddress(),
    );

    const proxyContract = await ethers.getContractAt(
      "RaffleExtended",
      await _proxyContract.getAddress(),
    );

    await proxyContract.initialize(
      whitelist,
      aggregators,
      uniswapV3Router,
      0n,
      ethers.randomBytes(32),
      owner.address,
    );

    return {
      contract: proxyContract,
      asd1Contract,
      usdtContract,
      usdcContract,
      linkContract,
      accountAsd1,
      accountUsdt,
      accountUsdc,
      accountLink,
    };
  };

  describe("Deployment", () => {
    it("Should deploy the contract", async () => {
      const { contract } = await loadFixture(deploy);
      // eslint-disable-next-line no-unused-expressions
      expect(contract).to.exist;
    });
  });

  describe("Raffle", () => {
    // describe("Basic deposits", () => {
    //   it("Should deposit once", async () => {
    //     const { contract, usdcContract, accountUsdc } =
    //       await loadFixture(deploy);
    //     const usdcSigner = contract.connect(accountUsdc);
    //     await usdcContract
    //       .connect(accountUsdc)
    //       .approve(await contract.getAddress(), 1000n);
    //     await usdcSigner.deposit(1000n, 2);
    //     expect(await contract.pool()).to.equal(997n);
    //   });
    //   it("Should deposit twice", async () => {
    //     const {
    //       contract,
    //       usdcContract,
    //       accountUsdc,
    //       usdtContract,
    //       accountUsdt,
    //     } = await loadFixture(deploy);
    //     const usdcSigner = contract.connect(accountUsdc);
    //     const usdtSigner = contract.connect(accountUsdt);
    //     await usdcContract
    //       .connect(accountUsdc)
    //       .approve(contract.getAddress(), 1000n);
    //     await usdcSigner.deposit(1000n, 2);
    //     await usdtContract
    //       .connect(accountUsdt)
    //       .approve(contract.getAddress(), 1000n);
    //     await usdtSigner.deposit(1000n, 1);
    //     expect(await contract.pool()).to.equal(1997n);
    //   });
    //   it("Should win when first", async () => {
    //     const {
    //       contract,
    //       usdcContract,
    //       accountUsdc,
    //       usdtContract,
    //       accountUsdt,
    //     } = await loadFixture(deploy);
    //     const usdcSigner = contract.connect(accountUsdc);
    //     const usdtSigner = contract.connect(accountUsdt);
    //     await usdtContract
    //       .connect(accountUsdt)
    //       .approve(contract.getAddress(), 2000n);
    //     await usdcContract
    //       .connect(accountUsdc)
    //       .approve(contract.getAddress(), 1000n);
    //     await usdtSigner.deposit(2000n, 1);
    //     await usdcSigner.deposit(1000n, 2);
    //     const resp = (
    //       await contract.queryFilter(contract.filters.Deposited())
    //     ).map(({ args }) => {
    //       return {
    //         id: args.id,
    //         deposit: args.deposit,
    //       };
    //     });
    //     const preBalance = await usdtContract.balanceOf(accountUsdt.address);
    //     await contract.rawFulfillRandomWords(0n, [500n]);
    //     await contract.withdraw(resp[0].id, resp[1].id);
    //     expect(await contract.pool()).to.equal(0n);
    //     expect(await usdtContract.balanceOf(accountUsdt.address)).to.equal(
    //       preBalance + 2997n,
    //     );
    //   });
    //   it("Should win when second", async () => {
    //     const {
    //       contract,
    //       usdcContract,
    //       accountUsdc,
    //       usdtContract,
    //       accountUsdt,
    //     } = await loadFixture(deploy);
    //     const usdcSigner = contract.connect(accountUsdc);
    //     const usdtSigner = contract.connect(accountUsdt);
    //     await usdtContract
    //       .connect(accountUsdt)
    //       .approve(contract.getAddress(), 1000n);
    //     await usdcContract
    //       .connect(accountUsdc)
    //       .approve(contract.getAddress(), 2000n);
    //     await usdtSigner.deposit(1000n, 1);
    //     await usdcSigner.deposit(2000n, 2);
    //     const resp = (
    //       await contract.queryFilter(contract.filters.Deposited())
    //     ).map(({ args }) => {
    //       return {
    //         id: args.id,
    //         deposit: args.deposit,
    //       };
    //     });
    //     const preBalance = await usdtContract.balanceOf(accountUsdc.address);
    //     await contract.rawFulfillRandomWords(0n, [2000n]);
    //     await contract.withdraw(resp[1].id, resp[1].id);
    //     expect(await contract.pool()).to.equal(0n);
    //     expect(await usdtContract.balanceOf(accountUsdc.address)).to.equal(
    //       preBalance + 2994n,
    //     );
    //   });
    // });

    it("Should permit", async () => {
      const { contract, usdcContract, accountUsdc } = await loadFixture(deploy);

      const usdcSigner = contract.connect(accountUsdc);

      const chainId = 31337;
      const tokenName = await usdcContract.name();
      const version = "2";
      const nonce = await usdcContract.nonces(await contract.getAddress());
      const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      const domain = {
        name: tokenName,
        version,
        chainId,
        verifyingContract: await usdcContract.getAddress(),
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: accountUsdc.address,
        spender: await contract.getAddress(),
        value: "1000",
        nonce,
        deadline,
      };

      try {
        const signature = await accountUsdc.signTypedData(
          domain,
          types,
          message,
        );

        const { r, s, v } = ethers.Signature.from(signature);

        await usdcSigner.permitDeposit(1000n, 2, deadline, r, s, v);
      } catch (error) {
        console.error("Error signing permit:", error);
      }
      expect(await contract.pool()).to.equal(997n);
    });

    // it("Should deposit weth", async () => {
    //   const { contract, asd1Contract, accountAsd1 } = await loadFixture(deploy);
    //   const asd1Signer = contract.connect(accountAsd1);
    //   await asd1Contract
    //     .connect(accountAsd1)
    //     .approve(contract.getAddress(), 1000n);
    //   console.log(await contract.getLatestPrice(0));
    //   await asd1Signer.deposit(1000n, 0);
    //   console.log(6);
    //   console.log(await contract.pool());
    //   expect(await contract.pool()).to.be.greaterThan(0n);
    // });
    // it("Should deposit link", async (done) => {
    //   const { contract, linkContract, accountLink } = await loadFixture(deploy);
    //   const linkSigner = contract.connect(accountLink);
    //   await linkContract
    //     .connect(accountLink)
    //     .approve(contract.getAddress(), 100000000000000000000000n);
    //   await linkSigner.deposit(100000000000000000000000n, 3);
    //   expect(await contract.pool()).to.be.greaterThan(0n);
    //   console.log(await contract.pool());
    //   done();
    // }).timeout(1000000);
  });
});
