import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { ethers } from "ethers";
import { type HardhatUserConfig } from "hardhat/config";

import { ETHERSCAN_API_KEY, INFURA_API_KEY, PRIVATE_KEY } from "./env";

function generateRandomPrivateKeys(count: number): string[] {
  const privateKeys = [];
  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.createRandom();
    privateKeys.push(wallet.privateKey);
  }
  return privateKeys;
}

const accounts = generateRandomPrivateKeys(10).map((key) => ({
  privateKey: key,
  balance: ethers.parseEther("10000").toString(),
}));

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      chainId: 1337,
      forking: {
        url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
        blockNumber: 6135000,
        // url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      },
      accounts: [
        {
          privateKey: PRIVATE_KEY,
          balance: ethers.parseEther("10000").toString(),
        },
        ...accounts,
      ],
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
