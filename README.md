```shell
yarn hardhat test
yarn hardhat node
yarn hardhat ignition deploy ./ignition/modules/<module name>.ts --reset
yarn h verify --contract contracts/<sol file:name> --network sepolia <contract address> <arguments>
yarn h run ./scripts/initialize.ts

yarn h ignition deploy ./ignition/modules/Raffle.ts --reset --network localhost
```
