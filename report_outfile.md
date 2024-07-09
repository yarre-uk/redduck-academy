## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/ERC20/BaseERC20.sol | [object Promise] |
| contracts/ERC20/IERC20.sol | [object Promise] |
| contracts/ERC20/TradableERC20.sol | [object Promise] |
| contracts/ERC20/VotingERC20.sol | [object Promise] |
| contracts/ERC20/YarreToken.sol | [object Promise] |
| contracts/Governance/Governance.sol | [object Promise] |
| contracts/Governance/GovernanceExtended.sol | [object Promise] |
| contracts/Governance/GovernanceToken.sol | [object Promise] |
| contracts/Governance/ProposalStorage.sol | [object Promise] |
| contracts/interfaces/IWETH.sol | [object Promise] |
| contracts/Marketplace/Marketplace.sol | [object Promise] |
| contracts/Marketplace/MarketplaceExtended.sol | [object Promise] |
| contracts/Marketplace/MarketplaceOff.sol | [object Promise] |
| contracts/Orderbook/LinkedList.sol | [object Promise] |
| contracts/Orderbook/MyERC1155.sol | [object Promise] |
| contracts/Orderbook/Orderbook.sol | [object Promise] |
| contracts/Orderbook/OrderbookStorage.sol | [object Promise] |
| contracts/Raffle/DepositStorage.sol | [object Promise] |
| contracts/Raffle/Raffle.sol | [object Promise] |
| contracts/Raffle/RaffleExtended.sol | [object Promise] |
| contracts/utils/MyProxy.sol | [object Promise] |
| contracts/utils/WETH.sol | [object Promise] |


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
| └ | _updateVoteOnInteraction | Internal 🔒 | 🛑  | |
| └ | buy | Public ❗️ |  💵 | hasNotVoted |
| └ | sell | Public ❗️ | 🛑  | hasNotVoted |
| └ | transfer | Public ❗️ | 🛑  | hasNotVoted |
| └ | transferFrom | Public ❗️ | 🛑  | hasNotVoted |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | buy | Public ❗️ |  💵 |NO❗️ |
| └ | _transferFromInternal | Internal 🔒 | 🛑  | |
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
| **YarreToken** | Implementation | TradableERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  | TradableERC20 |
||||||
| **Governance** | Implementation | Ownable, AccessControl, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | initialize | Public ❗️ | 🛑  | initializer onlyOwner |
| └ | createProposal | Public ❗️ | 🛑  | hasEnoughPercentage |
| └ | voteForProposal | Public ❗️ | 🛑  |NO❗️ |
| └ | _cancelProposal | Internal 🔒 | 🛑  | |
| └ | _executeProposal | Internal 🔒 | 🛑  | |
| └ | processProposal | Public ❗️ | 🛑  | onlyRole |
||||||
| **GovernanceExtended** | Implementation | Governance |||
| └ | grantRoleExecuter | Public ❗️ | 🛑  | onlyOwner |
| └ | revokeRoleExecuter | Public ❗️ | 🛑  | onlyOwner |
| └ | setTokenAddress | Public ❗️ | 🛑  | onlyOwner |
| └ | setRaffleAddress | Public ❗️ | 🛑  | onlyOwner |
| └ | setPercentageForProposal | Public ❗️ | 🛑  | onlyOwner |
| └ | setBlocksBeforeVoting | Public ❗️ | 🛑  | onlyOwner |
| └ | setBlocksBeforeExecution | Public ❗️ | 🛑  | onlyOwner |
| └ | getProposal | Public ❗️ |   |NO❗️ |
| └ | getProposals | Public ❗️ |   |NO❗️ |
||||||
| **GovernanceToken** | Implementation | ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC20 ERC20Permit Ownable |
| └ | _update | Internal 🔒 | 🛑  | |
| └ | nonces | Public ❗️ |   |NO❗️ |
| └ | mint | Public ❗️ | 🛑  | onlyOwner |
||||||
| **ProposalStorage** | Library |  |||
| └ | getId | Internal 🔒 |   | |
| └ | isEmpty | Internal 🔒 |   | |
| └ | addData | Internal 🔒 | 🛑  | |
| └ | getData | Internal 🔒 |   | |
||||||
| **IWETH** | Interface |  |||
| └ | deposit | External ❗️ |  💵 |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
||||||
| **Marketplace** | Implementation | Ownable, AccessControl, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | initialize | Public ❗️ | 🛑  | initializer onlyOwner |
| └ | createOrder | External ❗️ | 🛑  |NO❗️ |
| └ | processOrder | External ❗️ | 🛑  |NO❗️ |
| └ | cancelOrder | External ❗️ | 🛑  |NO❗️ |
| └ | getOrder | External ❗️ |   |NO❗️ |
| └ | getOrders | External ❗️ |   |NO❗️ |
||||||
| **MarketplaceExtended** | Implementation | MarketplaceOff |||
| └ | setNFTContract | External ❗️ | 🛑  | onlyOwner |
| └ | setWETHContract | External ❗️ | 🛑  | onlyOwner |
| └ | setOrdered | External ❗️ | 🛑  | onlyOwner |
| └ | setOrders | External ❗️ | 🛑  | onlyOwner |
||||||
| **MarketplaceOff** | Implementation | Ownable, AccessControl, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | initialize | Public ❗️ | 🛑  | initializer onlyOwner |
| └ | _getOrderId | Internal 🔒 |   | |
| └ | _verifyOrder | Internal 🔒 | 🛑  | |
| └ | createOrder | External ❗️ | 🛑  |NO❗️ |
| └ | processOrder | External ❗️ | 🛑  |NO❗️ |
| └ | cancelOrder | External ❗️ | 🛑  |NO❗️ |
||||||
| **LinkedListLibrary** | Library |  |||
| └ | getById | Internal 🔒 |   | |
| └ | isNotEmpty | Internal 🔒 |   | |
| └ | getLength | Internal 🔒 |   | |
| └ | getHead | Internal 🔒 |   | |
| └ | getTail | Internal 🔒 |   | |
| └ | getId | Internal 🔒 |   | |
| └ | push | Internal 🔒 | 🛑  | |
| └ | pushStart | Internal 🔒 | 🛑  | |
| └ | insert | Internal 🔒 | 🛑  | |
| └ | deleteNode | Internal 🔒 | 🛑  | |
| └ | clear | Internal 🔒 | 🛑  | |
| └ | traverse | Internal 🔒 |   | |
||||||
| **MyERC1155** | Implementation | ERC1155, Ownable |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC1155 Ownable |
| └ | setURI | Public ❗️ | 🛑  | onlyOwner |
| └ | mint | Public ❗️ | 🛑  |NO❗️ |
| └ | mintBatch | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Orderbook** | Implementation | Ownable, AccessControl, Initializable, ERC1155Holder |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | supportsInterface | Public ❗️ |   |NO❗️ |
| └ | initialize | Public ❗️ | 🛑  | initializer onlyOwner |
| └ | getOrder | External ❗️ |   |NO❗️ |
| └ | createPassiveOrder | External ❗️ |  💵 | validateOrder |
| └ | matchOrder | Public ❗️ | 🛑  |NO❗️ |
| └ | _processBuyOrder | Internal 🔒 | 🛑  | |
| └ | _processSellOrder | Internal 🔒 | 🛑  | |
| └ | traverseList | External ❗️ |   |NO❗️ |
||||||
| **DepositStorage** | Library |  |||
| └ | getId | Internal 🔒 |   | |
| └ | isEmpty | Internal 🔒 |   | |
| └ | addNode | Internal 🔒 | 🛑  | |
||||||
| **Raffle** | Implementation | VRFConsumerBaseV2Plus, AutomationCompatibleInterface |||
| └ | <Constructor> | Public ❗️ | 🛑  | VRFConsumerBaseV2Plus |
| └ | initialize | Public ❗️ | 🛑  | onlyOwner |
| └ | deposit | Public ❗️ | 🛑  |NO❗️ |
| └ | permitDeposit | Public ❗️ | 🛑  |NO❗️ |
| └ | _concludeWithdraw | Internal 🔒 | 🛑  | |
| └ | withdraw | Public ❗️ | 🛑  |NO❗️ |
| └ | _withdrawLast | Internal 🔒 | 🛑  | |
| └ | fulfillRandomWords | Internal 🔒 | 🛑  | |
| └ | requestRandomWordsAdmin | Public ❗️ | 🛑  | onlyOwner |
| └ | _requestRandomWords | Internal 🔒 | 🛑  | |
| └ | checkUpkeep | External ❗️ |   |NO❗️ |
| └ | performUpkeep | External ❗️ | 🛑  |NO❗️ |
||||||
| **RaffleExtended** | Implementation | Raffle |||
| └ | setWaitingForRandomness | Public ❗️ | 🛑  | onlyOwner |
| └ | setForwarderAddress | External ❗️ | 🛑  | onlyOwner |
| └ | setWhitelist | Public ❗️ | 🛑  | onlyOwner |
| └ | setGovernor | Public ❗️ | 🛑  | onlyOwner |
| └ | getChance | Public ❗️ |   |NO❗️ |
| └ | getDeposit | Public ❗️ |   |NO❗️ |
| └ | getDeposits | Public ❗️ |   |NO❗️ |
| └ | setX | Public ❗️ | 🛑  | onlyOwnerOrGovernor |
| └ | setY | Public ❗️ | 🛑  | onlyOwnerOrGovernor |
| └ | setZ | Public ❗️ | 🛑  | onlyOwnerOrGovernor |
| └ | setFounder | Public ❗️ | 🛑  | onlyOwner |
| └ | setStaking | Public ❗️ | 🛑  | onlyOwner |
| └ | setStatus | Public ❗️ | 🛑  | onlyOwner |
| └ | _concludeWithdraw | Internal 🔒 | 🛑  | |
||||||
| **MyProxy** | Implementation | Ownable, Proxy |||
| └ | <Constructor> | Public ❗️ | 🛑  | Ownable |
| └ | setImplementation | External ❗️ | 🛑  | onlyOwner |
| └ | getImplementation | External ❗️ |   |NO❗️ |
| └ | _implementation | Internal 🔒 |   | |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **WETH** | Implementation |  |||
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | deposit | Public ❗️ |  💵 |NO❗️ |
| └ | mint | Public ❗️ | 🛑  |NO❗️ |
| └ | withdraw | Public ❗️ | 🛑  |NO❗️ |
| └ | totalSupply | Public ❗️ |   |NO❗️ |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | transfer | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | Public ❗️ | 🛑  |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
