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
| contracts/Raffle/DepositStorage.sol | [object Promise] |
| contracts/Raffle/MyProxy.sol | [object Promise] |
| contracts/Raffle/Raffle.sol | [object Promise] |
| contracts/Raffle/RaffleExtended.sol | [object Promise] |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **BaseERC20** | Implementation | IERC20, Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
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
| **DepositStorage** | Library |  |||
| └ | getId | Internal 🔒 |   | |
| └ | isEmpty | Internal 🔒 |   | |
| └ | addNode | Internal 🔒 | 🛑  | |
||||||
| **MyProxy** | Implementation | Ownable, Proxy |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | setImplementation | External ❗️ | 🛑  | onlyOwner |
| └ | getImplementation | External ❗️ |   |NO❗️ |
| └ | _implementation | Internal 🔒 |   | |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **Raffle** | Implementation | VRFConsumerBaseV2Plus, AutomationCompatibleInterface |||
| └ | <Constructor> | Public ❗️ | 🛑  | VRFConsumerBaseV2Plus |
| └ | initialize | Public ❗️ | 🛑  | onlyOwner |
| └ | deposit | Public ❗️ | 🛑  |NO❗️ |
| └ | permitDeposit | Public ❗️ | 🛑  |NO❗️ |
| └ | concludeWithdraw | Internal 🔒 | 🛑  | |
| └ | withdraw | Public ❗️ | 🛑  |NO❗️ |
| └ | _withdrawLast | Internal 🔒 | 🛑  | |
| └ | fulfillRandomWords | Internal 🔒 | 🛑  | |
| └ | _requestRandomWords | Internal 🔒 | 🛑  | |
| └ | checkUpkeep | External ❗️ |   |NO❗️ |
| └ | performUpkeep | External ❗️ | 🛑  |NO❗️ |
||||||
| **RaffleExtended** | Implementation | Raffle |||
| └ | setForwarderAddress | External ❗️ | 🛑  | onlyOwner |
| └ | setWhitelist | Public ❗️ | 🛑  | onlyOwner |
| └ | getChance | Public ❗️ |   |NO❗️ |
| └ | getDeposit | Public ❗️ |   |NO❗️ |
| └ | getDeposits | Public ❗️ |   |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
