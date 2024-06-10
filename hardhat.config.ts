import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { type HardhatUserConfig, task } from "hardhat/config";
import "./scripts/initialize";

import { ETHERSCAN_API_KEY, INFURA_API_KEY, PRIVATE_KEY } from "./env";

task("initialize", "Initializes the contract")
  .addParam("proxy")
  .addParam("contract")
  .setAction(async (taskArgs, hre) => {
    await hre.run("initialize:internal", {
      proxy: taskArgs.proxy,
      contract: taskArgs.contract,
    });
  });

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
        // url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
