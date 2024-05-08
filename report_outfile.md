## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/ERC20/BaseERC20.sol | [object Promise] |
| contracts/ERC20/IERC20.sol | [object Promise] |
| contracts/ERC20/TradableERC20.sol | [object Promise] |
| contracts/ERC20/VotingERC20.sol | [object Promise] |
| contracts/utils/Merkle.sol | [object Promise] |
| contracts/utils/Ownable.sol | [object Promise] |
| contracts/utils/VotingLinkedList.sol | [object Promise] |
| contracts/Vesting/Vesting1.sol | [object Promise] |
| contracts/Vesting/Vesting2.sol | [object Promise] |
| contracts/Vesting/Vesting3.sol | [object Promise] |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **BaseERC20** | Implementation | IERC20, Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | balanceOf | Public ❗️ |   |NO❗️ |
| └ | transfer | Public ❗️ | 🛑  | validAddress |
| └ | allowance | Public ❗️ |   |NO❗️ |
| └ | approve | Public ❗️ | 🛑  | validAddress |
| └ | transferFrom | Public ❗️ | 🛑  | validAddress validAddress |
| └ | totalSupply | Public ❗️ |   |NO❗️ |
| └ | _mint | Internal 🔒 | 🛑  | validAddress |
| └ | _burn | Internal 🔒 | 🛑  | validAddress |
||||||
| **IERC20** | Interface |  |||
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
||||||
| **TradableERC20** | Implementation | VotingERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  | VotingERC20 |
| └ | updateVoteOnInteraction | Internal 🔒 | 🛑  | |
| └ | buy | Public ❗️ |  💵 | hasNotVoted |
| └ | sell | Public ❗️ | 🛑  | hasNotVoted |
| └ | transfer | Public ❗️ | 🛑  | hasNotVoted |
| └ | transferFrom | Public ❗️ | 🛑  | hasNotVoted |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | buy | Public ❗️ |  💵 |NO❗️ |
| └ | transferFromInternal | Internal 🔒 | 🛑  | |
| └ | sell | Public ❗️ | 🛑  |NO❗️ |
| └ | transfer | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | Public ❗️ | 🛑  |NO❗️ |
| └ | setFeePercentage | Public ❗️ | 🛑  | onlyOwner |
| └ | collectAndBurnFee | Public ❗️ | 🛑  | onlyOwner |
| └ | getFeeBalance | Public ❗️ |   | onlyOwner |
| └ | withdrawBalanceAmount | Public ❗️ | 🛑  | onlyOwner |
| └ | withdrawBalance | Public ❗️ | 🛑  | onlyOwner |
||||||
| **VotingERC20** | Implementation | BaseERC20, VotingLinkedList |||
| └ | <Constructor> | Public ❗️ | 🛑  | BaseERC20 |
| └ | _ownsMoreThan | Internal 🔒 |   | |
| └ | _startVoting | Internal 🔒 | 🛑  | |
| └ | _updateList | Internal 🔒 | 🛑  | |
| └ | userPercentage | Public ❗️ |   |NO❗️ |
| └ | stopVoting | Public ❗️ | 🛑  |NO❗️ |
| └ | vote | Public ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **Merkle** | Implementation |  |||
| └ | checkProof | Public ❗️ |   |NO❗️ |
||||||
| **Ownable** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
||||||
| **VotingLinkedList** | Implementation |  |||
| └ | getById | Public ❗️ |   |NO❗️ |
| └ | isNotEmpty | Public ❗️ |   |NO❗️ |
| └ | getHead | Public ❗️ |   |NO❗️ |
| └ | getTail | Public ❗️ |   |NO❗️ |
| └ | getId | Public ❗️ |   |NO❗️ |
| └ | push | Public ❗️ | 🛑  |NO❗️ |
| └ | pushStart | Public ❗️ | 🛑  |NO❗️ |
| └ | insert | Public ❗️ | 🛑  |NO❗️ |
| └ | deleteNode | Public ❗️ | 🛑  |NO❗️ |
| └ | clear | Public ❗️ | 🛑  |NO❗️ |
| └ | traverse | Public ❗️ |   |NO❗️ |
||||||
| **Vesting1** | Implementation | Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | claim | Public ❗️ | 🛑  |NO❗️ |
| └ | addAddress | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Vesting2** | Implementation | Ownable, Merkle |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | claim | Public ❗️ | 🛑  |NO❗️ |
| └ | setRoot | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Vesting3** | Implementation | Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | claim | Public ❗️ | 🛑  |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
