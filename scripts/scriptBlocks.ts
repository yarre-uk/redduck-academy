import { mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function main() {
  await mine(101, { interval: 0 });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
