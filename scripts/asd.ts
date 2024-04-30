function computeHash(computedHash: string, proofElement: string): string {
  const sortedHashes = [computedHash, proofElement].sort();

  return `${sortedHashes[0]}${sortedHashes[1]}`;
}

const oneLevelUp = (inputArray: string[]) => {
  const result = [];
  const inp = [...inputArray];

  if (inp.length % 2 === 1) {
    inp.push(inp[inp.length - 1]);
  }

  for (let i = 0; i < inp.length; i += 2) {
    result.push(computeHash(inp[i], inp[i + 1]));
  }

  console.log(result);

  return result;
};

const getMerkleRoot = (array: string[]) => {
  let result = array;

  while (result.length > 1) {
    result = oneLevelUp(result);
  }

  return result[0];
};

const getMerkleProof = (array: string[], index: number) => {
  const result = [];
  let currentLayer = [...array];
  let currentIndex = index;
  let firstLayer = true;

  while (currentLayer.length > 1) {
    if (currentLayer.length % 2) {
      currentLayer.push(currentLayer[currentLayer.length - 1]);
    }

    if (!firstLayer) {
      result.push(
        currentIndex % 2
          ? currentLayer[currentIndex - 1]
          : currentLayer[currentIndex + 1],
      );
    } else {
      result.push(currentLayer[currentIndex]);
      firstLayer = false;
    }

    currentIndex = Math.floor(currentIndex / 2);
    currentLayer = oneLevelUp(currentLayer);
  }
  return result;
};

const testArray = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];

console.log(getMerkleProof(testArray, 5));
