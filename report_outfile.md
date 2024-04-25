## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/DOS/DOS.sol | [object Promise] |
| contracts/Reentrancy/Attacker.sol | [object Promise] |
| contracts/Reentrancy/Reentrancy.sol | [object Promise] |
| contracts/utils/Ownable.sol | [object Promise] |
| contracts/utils/ReentrancyGuard.sol | [object Promise] |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **DOS** | Implementation |  |||
| └ | deposit | Public ❗️ |  💵 | canInteract |
| └ | withdraw | Public ❗️ | 🛑  | canInteract |
| └ | vote | Public ❗️ | 🛑  | canInteract |
| └ | concludeVoting | Public ❗️ | 🛑  |NO❗️ |
||||||
| **Attacker** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | attack | Public ❗️ |  💵 |NO❗️ |
||||||
| **Reentrancy** | Implementation | ReentrancyGuard |||
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | withdraw | Public ❗️ | 🛑  | nonReentrant |
| └ | withdrawAll | Public ❗️ | 🛑  | nonReentrant |
| └ | transfer | Public ❗️ | 🛑  |NO❗️ |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | Public ❗️ | 🛑  |NO❗️ |
||||||
| **Ownable** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
||||||
| **ReentrancyGuard** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | _nonReentrantBefore | Private 🔐 | 🛑  | |
| └ | _nonReentrantAfter | Private 🔐 | 🛑  | |
| └ | _reentrancyGuardEntered | Internal 🔒 |   | |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
