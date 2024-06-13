import { ethers } from "hardhat";

class MerkleTree {
  private _tree: string[][] = [];

  constructor(elements: string[]) {
    this.createTree(elements);
  }

  getTree = () => {
    return this._tree;
  };

  getMerkleRoot = () => {
    return this._tree[this._tree.length - 1][0];
  };

  createTree = (elements: string[]) => {
    const tree = [elements];

    if (elements.length === 0) {
      throw new Error("empty tree");
    }

    let layer = 0;
    while (tree[layer].length > 1) {
      tree.push(MerkleTree.oneLevelUp(tree[tree.length - 1]));
      layer++;
    }

    this._tree = tree;
  };

  getMerkleProof = (index: number) => {
    const result = [];
    let currentLayer = 0;
    let currentIndex = index;

    while (currentLayer < this._tree.length - 1) {
      let element;

      if (
        currentIndex % 2 === 0 &&
        currentIndex + 1 > this._tree[currentLayer].length - 1
      ) {
        element = this._tree[currentLayer][currentIndex];
      } else {
        element =
          currentIndex % 2
            ? this._tree[currentLayer][currentIndex - 1]
            : this._tree[currentLayer][currentIndex + 1];
      }

      result.push(element);

      currentIndex = Math.floor(currentIndex / 2);
      currentLayer++;
    }
    return result;
  };

  verify = (proof: string[], leaf: string) => {
    let computedHash = leaf;

    for (let i = 0; i < proof.length; i++) {
      computedHash = MerkleTree.computeHash(computedHash, proof[i]);
    }

    return computedHash === this.getMerkleRoot();
  };

  static computeHash(computedHash: string, proofElement: string): string {
    const hashes = [computedHash, proofElement].sort();

    return ethers.keccak256(
      ethers.solidityPacked(["bytes32", "bytes32"], hashes),
    );
  }

  static oneLevelUp = (inputArray: string[]) => {
    const result = [];
    const inp = [...inputArray];

    if (inp.length % 2 === 1) {
      inp.push(inp[inp.length - 1]);
    }

    for (let i = 0; i < inp.length; i += 2) {
      result.push(MerkleTree.computeHash(inp[i], inp[i + 1]));
    }

    return result;
  };
}

export default MerkleTree;
