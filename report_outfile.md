## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/ERC20/BaseERC20.sol | [object Promise] |
| contracts/ERC20/IERC20.sol | [object Promise] |
| contracts/ERC20/TradableERC20.sol | [object Promise] |
| contracts/ERC20/VotingERC20.sol | [object Promise] |
| contracts/ERC20/YarreToken.sol | [object Promise] |
| contracts/interfaces/IWETH.sol | [object Promise] |
| contracts/utils/DepositStorage.sol | [object Promise] |
| contracts/utils/Merkle.sol | [object Promise] |
| contracts/utils/MyProxy.sol | [object Promise] |
| contracts/utils/Ownable.sol | [object Promise] |


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
| └ | buy | Public ❗️ |  💵 | haveNotVoted |
| └ | sell | Public ❗️ | 🛑  | haveNotVoted |
| └ | transfer | Public ❗️ | 🛑  | haveNotVoted |
| └ | approve | Public ❗️ | 🛑  | haveNotVoted |
| └ | setFeePercentage | Public ❗️ | 🛑  | onlyOwner |
| └ | collectAndBurnFee | Public ❗️ | 🛑  | onlyOwner |
| └ | getFeeBalance | Public ❗️ |   | onlyOwner |
| └ | withdrawBalanceAmount | Public ❗️ | 🛑  | onlyOwner |
| └ | withdrawBalance | Public ❗️ | 🛑  | onlyOwner |
||||||
| **VotingERC20** | Implementation | BaseERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  | BaseERC20 |
| └ | _ownsMoreThan | Internal 🔒 |   | |
| └ | _startVoting | Internal 🔒 | 🛑  | |
| └ | _updatePrice | Internal 🔒 | 🛑  | |
| └ | userPercentage | Public ❗️ |   |NO❗️ |
| └ | stopVoting | Public ❗️ | 🛑  |NO❗️ |
| └ | vote | Public ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **YarreToken** | Implementation | TradableERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  | TradableERC20 |
||||||
| **IWETH** | Interface |  |||
| └ | deposit | External ❗️ |  💵 |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
||||||
| **DepositStorage** | Implementation | VRFConsumerBaseV2Plus |||
| └ | <Constructor> | Public ❗️ | 🛑  | VRFConsumerBaseV2Plus |
| └ | getId | Public ❗️ |   |NO❗️ |
| └ | isEmpty | Public ❗️ |   |NO❗️ |
| └ | addNode | Public ❗️ | 🛑  |NO❗️ |
| └ | setPoolFee | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Merkle** | Implementation |  |||
| └ | checkProof | Public ❗️ |   |NO❗️ |
||||||
| **MyProxy** | Implementation | Ownable, Proxy |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | setImplementation | External ❗️ | 🛑  | onlyOwner |
| └ | _implementation | Internal 🔒 |   | |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **Ownable** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
