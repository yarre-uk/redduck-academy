## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/DOS/DOS.sol | [object Promise] |
| contracts/Reentrancy/Attacker.sol | [object Promise] |
| contracts/Reentrancy/AttackerAll.sol | [object Promise] |
| contracts/Reentrancy/Reentrancy.sol | [object Promise] |
| contracts/utils/Ownable.sol | [object Promise] |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **DOS** | Implementation |  |||
| └ | deposit | Public ❗️ |  💵 | canVote |
| └ | withdraw | Public ❗️ | 🛑  | canVote |
| └ | vote | Public ❗️ | 🛑  | canVote |
| └ | concludeVoting | Public ❗️ | 🛑  |NO❗️ |
||||||
| **Attacker** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | attack | Public ❗️ |  💵 |NO❗️ |
||||||
| **AttackerAll** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | attack | Public ❗️ |  💵 |NO❗️ |
||||||
| **Reentrancy** | Implementation |  |||
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | withdraw | Public ❗️ | 🛑  |NO❗️ |
| └ | withdrawAll | Public ❗️ | 🛑  |NO❗️ |
| └ | transfer | Public ❗️ | 🛑  |NO❗️ |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | Public ❗️ | 🛑  |NO❗️ |
||||||
| **Ownable** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
