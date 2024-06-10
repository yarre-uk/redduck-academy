// import { subtask } from "hardhat/config";

// import { abi as proxyAbi } from "../artifacts/contracts/Raffle/MyProxy.sol/MyProxy.json";
// import { abi as raffleAbi } from "../artifacts/contracts/Raffle/RaffleExtended.sol/RaffleExtended.json";
// import { PRIVATE_KEY } from "../env";

// subtask("initialize:internal", "Internal initialize task")
//   .addParam("proxy")
//   .addParam("contract")
//   .setAction(async (taskArgs, hre) => {
//     console.log("Start");

//     const wallet = new hre.ethers.Wallet(PRIVATE_KEY).connect(
//       hre.ethers.provider,
//     );

//     const proxyContract = new hre.ethers.Contract(
//       taskArgs.proxy,
//       proxyAbi,
//       wallet,
//     );

//     console.log("Setting implementation");
//     await proxyContract.setImplementation(taskArgs.contract);

//     const proxyRaffleContract = new hre.ethers.Contract(
//       taskArgs.proxy,
//       raffleAbi,
//       wallet,
//     );

//     const weth = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f";
//     const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
//     const approvedTokens: `0x${string}`[] = [weth, link];

//     const uniswapRouter = "0x425141165d3DE9FEC831896C016617a52363b687";

//     const subscriptionId =
//       1230560835588391700105489398649300104699330861740292705239295065739960848769n;
//     const keyHash =
//       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
//     const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";

//     console.log("Initializing contract");
//     await proxyRaffleContract.initialize(
//       approvedTokens,
//       uniswapRouter,
//       subscriptionId,
//       keyHash,
//       vrfCoordinator,
//     );

//     console.log("End");
//   });
