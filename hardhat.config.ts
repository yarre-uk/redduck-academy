import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { type HardhatUserConfig } from "hardhat/config";

import { ETHERSCAN_API_KEY, INFURA_API_KEY, PRIVATE_KEY } from "./env";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
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
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
