import { ethers } from "hardhat";

import MerkleTree from "../utils/merkle";

const ACCOUNT_NUMBER = 100;

const accounts = [];
const addresses = [];

for (let i = 0; i < ACCOUNT_NUMBER; i++) {
  const account = ethers.Wallet.createRandom(ethers.provider);
  accounts.push(account);
  addresses.push(account.address);
}

const testArray = new Array(ACCOUNT_NUMBER).fill(0).map((_, i) => i.toString());

const merkle = new MerkleTree(testArray);

// console.log(merkle.getTree());

console.log("---");

for (let i = 0; i < 16; i++) {
  const proof = merkle.getMerkleProof(i);

  if (merkle.verify(proof, testArray[i]) === false) {
    console.log("proof is invalid", i);
  }

  // console.log(testArray[i], proof);
}

console.log("---");

// for (let i = 0; i < ACCOUNT_NUMBER; i++) {
//   console.log("hash ->", addresses[i]);
//   const proof = merkle.getMerkleProof(i);

//   if (proof.some((p) => p === undefined)) {
//     console.log("proof is invalid");
//   }

//   console.log(proof);
// }
