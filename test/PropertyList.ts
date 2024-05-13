import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import fc from "fast-check";
import { ethers } from "hardhat";

import { VotingLinkedList__factory } from "../typechain-types";
import { VotingLinkedList } from "../utils/list";

const canPushValues = async (values: number[]) => {
  const { votingList } = await loadFixture(deploy);

  const repetitions: Record<string, number> = {};

  const uniqueValues = values
    .sort((a, b) => a - b)
    .filter((value) => {
      if (repetitions[value]) {
        repetitions[value]++;
        return false;
      } else {
        repetitions[value] = 1;
        return true;
      }
    });

  await votingList.push(0, BigInt(uniqueValues[0]), BigInt(uniqueValues[0]));

  for (let i = 1; i < uniqueValues.length; i++) {
    await votingList.push(0, BigInt(uniqueValues[i]), BigInt(uniqueValues[i]));
  }

  expect(
    (await votingList.getById(await votingList.getTail())).price,
  ).to.deep.equal(uniqueValues[uniqueValues.length - 1]);
};

// const canInsertSortedValues = async (values: number[]) => {
//   const { votingList } = await loadFixture(deploy);

//   const repetitions: Record<string, number> = {};

//   const uniqueValues = values.filter((value) => {
//     if (repetitions[value]) {
//       repetitions[value]++;
//       return false;
//     } else {
//       repetitions[value] = 1;
//       return true;
//     }
//   });

//   let max = uniqueValues[0];

//   await votingList.push(0, BigInt(uniqueValues[0]), BigInt(uniqueValues[0]));

//   for (let i = 1; i < uniqueValues.length; i++) {
//     await votingList.insert(
//       0,
//       VotingLinkedList.getId(0, uniqueValues[i - 1]),
//       BigInt(uniqueValues[i]),
//       BigInt(uniqueValues[i]),
//     );

//     max = Math.max(max, uniqueValues[i]);
//   }

//   const res = (await votingList.getById(await votingList.getTail()))[0];

//   await votingList.traverse();

//   console.log("-----------------");

//   expect(res).to.deep.equal(max);
// };

async function deploy() {
  const [owner] = await ethers.getSigners();

  const votingList = await new VotingLinkedList__factory(owner).deploy();

  return {
    owner,
    votingList,
  };
}

describe("Property Based Tests For VotingList", () => {
  it("should push values", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1 }), {
          minLength: 1,
        }),
        canPushValues,
      ),
    );
  });

  // it("should insert values", async () => {
  //   await fc.assert(
  //     fc.asyncProperty(
  //       fc.array(fc.integer({ min: 1 }), {
  //         minLength: 2,
  //       }),
  //       canInsertSortedValues,
  //     ),
  //   );
  // });
});
