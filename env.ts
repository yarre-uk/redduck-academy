import dotenv from "dotenv";
dotenv.config();

export const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
export const MNEMONICS = process.env.MNEMONICS || "";
