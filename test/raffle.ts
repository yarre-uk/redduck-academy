import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Raffle__factory } from "../typechain-types";

describe("Raffle", () => {
  const deploy = async () => {
    const [owner, accountWeth, accountUsdt, accountUsdc, accountLink] =
      await ethers.getSigners();

    const uniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const link = "0x514910771af9ca656af840dff83e8264ecf986ca";

    const wethOracle = "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46";
    const usdtOracle = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D";
    const usdcOracle = "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6";
    const linkOracle = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c";

    const wethContract = await ethers.getContractAt("IWETH", weth);
    const usdtContract = await ethers.getContractAt("BaseERC20", usdt);
    const usdcContract = await ethers.getContractAt("BaseERC20", usdc);
    const linkContract = await ethers.getContractAt("BaseERC20", link);

    const wethHolder = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";
    const usdtHolder = "0x4Ee7bBc295A090aD0F6db12fe7eE4dC8de896400";
    const usdcHolder = "0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa";
    const linkHolder = "0x0757e27AC1631beEB37eeD3270cc6301dD3D57D4";

    const wethUser = await ethers.getImpersonatedSigner(wethHolder);
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

    await sendETH(await wethUser.getAddress(), ethers.parseEther("1000"));
    await sendETH(await usdtUser.getAddress(), ethers.parseEther("1000"));
    await sendETH(await usdcUser.getAddress(), ethers.parseEther("1000"));
    await sendETH(await linkUser.getAddress(), ethers.parseEther("1000"));

    await wethContract.connect(wethUser).transfer(accountWeth.address, 10000n);
    await usdtContract.connect(usdtUser).transfer(accountUsdt.address, 10000n);
    await usdcContract.connect(usdcUser).transfer(accountUsdc.address, 10000n);
    await linkContract.connect(linkUser).transfer(accountLink.address, 10000n);

    const whitelist = [weth, usdt, usdc, link];
    const aggregators = [wethOracle, usdtOracle, usdcOracle, linkOracle];

    const contract = await new Raffle__factory(owner).deploy(
      whitelist,
      uniswapV3Router,
      aggregators,
    );

    return {
      contract,
      wethContract,
      usdtContract,
      usdcContract,
      linkContract,
      accountWeth,
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

  // it("Price feed test", async () => {
  //   const { contract } = await loadFixture(deploy);

  //   console.log(await contract.getLatestPrice(0));
  //   console.log(await contract.getLatestPrice(1));
  //   console.log(await contract.getLatestPrice(2));
  //   console.log(await contract.getLatestPrice(3));
  // });

  describe("Raffle", () => {
    it("Should deposit once", async () => {
      const { contract, usdcContract, accountUsdc } = await loadFixture(deploy);

      const usdcSigner = contract.connect(accountUsdc);

      await usdcContract
        .connect(accountUsdc)
        .approve(contract.getAddress(), 1000n);

      await usdcSigner.deposit(1000n, 2);

      expect(await contract.pool()).to.equal(997n);
    });

    it("Should deposit twice", async () => {
      const { contract, usdcContract, accountUsdc, usdtContract, accountUsdt } =
        await loadFixture(deploy);

      const usdcSigner = contract.connect(accountUsdc);
      const usdtSigner = contract.connect(accountUsdt);

      await usdcContract
        .connect(accountUsdc)
        .approve(contract.getAddress(), 1000n);
      await usdcSigner.deposit(1000n, 2);

      await usdtContract
        .connect(accountUsdt)
        .approve(contract.getAddress(), 1000n);
      await usdtSigner.deposit(1000n, 1);

      expect(await contract.pool()).to.equal(1997n);
    });

    it("Should win", async () => {
      const { contract, usdcContract, accountUsdc, usdtContract, accountUsdt } =
        await loadFixture(deploy);

      console.log(await usdtContract.balanceOf(accountUsdt.address));
      console.log(await usdtContract.balanceOf(contract.getAddress()));

      const usdcSigner = contract.connect(accountUsdc);
      const usdtSigner = contract.connect(accountUsdt);

      await usdtContract
        .connect(accountUsdt)
        .approve(contract.getAddress(), 2000n);
      await usdtSigner.deposit(2000n, 1);

      await usdcContract
        .connect(accountUsdc)
        .approve(contract.getAddress(), 1000n);
      await usdcSigner.deposit(1000n, 2);

      const resp = (
        await contract.queryFilter(contract.filters.Deposited())
      ).map(({ args }) => {
        return {
          id: args.id,
          deposit: args.deposit,
        };
      });

      const preBalance = await usdtContract.balanceOf(accountUsdt.address);

      await contract.endRaffle(resp[0].id, resp[1].id, 500n);

      expect(await contract.pool()).to.equal(0n);
      expect(await usdtContract.balanceOf(accountUsdt.address)).to.equal(
        preBalance + 2997n,
      );

      // expect(await contract.pool()).to.equal(994n);
    });
  });
});
