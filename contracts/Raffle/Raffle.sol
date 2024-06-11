// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { TransferHelper } from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import { VRFV2PlusClient } from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import { IVRFCoordinatorV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFConsumerBaseV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import { DepositStorage, State, Deposit } from "./DepositStorage.sol";

import "hardhat/console.sol";

enum RaffleStatus {
    FINISHED,
    OPEN,
    CLOSED
}

abstract contract Raffle is
    VRFConsumerBaseV2Plus,
    AutomationCompatibleInterface
{
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint32 constant NUM_WORDS = 1;
    uint256[] public randomWords;
    uint256 internal requestId;
    uint256 private subscriptionId;
    bytes32 private keyHash;

    uint256 public raffleId;
    uint256 public pool = 0;
    RaffleStatus public status;
    address[] public whitelist;
    State public depositState;
    uint256 public timeToClose;
    uint256 public startedAt;

    address public forwarderAddress;
    IUniswapV2Router02 internal uniswapRouter;

    using DepositStorage for State;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    event RaffleStarted(uint256 indexed raffleId);
    event RaffleClosed(uint256 indexed raffleId);
    event RaffleFinished(uint256 indexed raffleId);

    event Deposited(
        uint256 indexed raffleId,
        address indexed sender,
        bytes32 indexed prevDeposit,
        bytes32 id
    );

    constructor() VRFConsumerBaseV2Plus(address(this)) {
        console.log("Constructor");
        console.log(msg.sender);
        console.log(owner());
    }

    function initialize(
        address[] memory _approvedTokens,
        IUniswapV2Router02 _uniswapRouter,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        address _vrfCoordinator
    ) public virtual {
        whitelist = _approvedTokens;
        uniswapRouter = _uniswapRouter;
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;

        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);

        timeToClose = 5 minutes;
        startedAt = block.timestamp;

        console.log("Initialize");
    }

    function deposit(uint256 _amount, uint256 _tokenIndex) public {
        require(
            status == RaffleStatus.OPEN || status == RaffleStatus.FINISHED,
            "Raffle is not open"
        );
        require(whitelist[_tokenIndex] != address(0), "Wrong token index");
        require(_amount > 0, "Amount should be greater than 0");
        require(
            block.timestamp < startedAt + timeToClose ||
                status == RaffleStatus.FINISHED,
            "Raffle is closed"
        );

        uint256 deposited;

        console.log(
            "Deposit -> ",
            _amount,
            _tokenIndex,
            whitelist[_tokenIndex]
        );

        if (_tokenIndex != 0) {
            TransferHelper.safeTransferFrom(
                whitelist[_tokenIndex],
                msg.sender,
                address(this),
                _amount
            );

            TransferHelper.safeApprove(
                whitelist[_tokenIndex],
                address(uniswapRouter),
                _amount
            );

            address[] memory path = new address[](2);
            path[0] = whitelist[_tokenIndex];
            path[1] = whitelist[0];

            console.log("Path -> ", whitelist[_tokenIndex], whitelist[0]);

            uint[] memory targetAmounts = uniswapRouter.getAmountsOut(
                _amount,
                path
            );
            uint256 minAmountOut = targetAmounts[targetAmounts.length - 1];

            console.log("minAmountOut -> ", minAmountOut);

            uint256[] memory result = uniswapRouter.swapExactTokensForTokens(
                _amount,
                minAmountOut,
                path,
                address(this),
                block.timestamp
            );

            deposited = result[result.length - 1];
        } else {
            console.log(
                "Deposit -> ",
                _amount,
                _tokenIndex,
                whitelist[_tokenIndex]
            );

            TransferHelper.safeTransferFrom(
                whitelist[0],
                msg.sender,
                address(this),
                _amount
            );
            deposited = _amount;
        }

        pool += deposited;

        console.log("Pool -> ", pool);

        Deposit memory depositDto = Deposit({
            raffleId: raffleId,
            sender: msg.sender,
            amount: deposited,
            point: pool - deposited,
            prevDeposit: depositState.lastDepositId
        });

        depositState.addNode(depositDto);

        if (status == RaffleStatus.FINISHED) {
            status = RaffleStatus.OPEN;
            startedAt = block.timestamp;
            emit RaffleStarted(raffleId);
        }

        emit Deposited(
            raffleId,
            depositDto.sender,
            depositDto.prevDeposit,
            depositState.lastDepositId
        );

        console.log("Deposit");
    }

    function permitDeposit(
        uint256 _amount,
        uint256 _tokenIndex,
        uint256 _deadline,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    ) public {
        ERC20Permit(whitelist[_tokenIndex]).permit(
            msg.sender,
            address(this),
            _amount,
            _deadline,
            _v,
            _r,
            _s
        );

        deposit(_amount, _tokenIndex);
    }

    function withdraw(bytes32 depositId, bytes32 nextDepositId) public {
        uint256 random = randomWords[0] % pool;

        require(status == RaffleStatus.CLOSED, "Raffle is not closed");
        require(block.timestamp > startedAt + timeToClose, "Raffle is open");
        // require(startedAt + timeToClose > block.timestamp, "Raffle is closed");

        if (
            nextDepositId == depositState.lastDepositId &&
            depositId == depositState.lastDepositId
        ) {
            _withdrawLast(depositId);
            return;
        }

        Deposit memory depositNode = depositState.deposits[depositId];
        Deposit memory nextDepositNode = depositState.deposits[nextDepositId];

        require(!depositState.isEmpty(depositId), "Deposit not found");
        require(!depositState.isEmpty(nextDepositId), "Next deposit not found");

        require(
            depositNode.raffleId == raffleId,
            "Deposit is not from this raffle"
        );
        require(
            nextDepositNode.raffleId == raffleId,
            "Next deposit is not from this raffle"
        );

        require(
            nextDepositNode.prevDeposit == depositId,
            "Wrong order of deposits"
        );

        require(
            depositNode.point + depositNode.amount == nextDepositNode.point,
            "Wrong order of deposits(points)"
        );

        require(
            depositNode.point <= random && random < nextDepositNode.point,
            "This user is not a winner"
        );

        TransferHelper.safeTransfer(whitelist[0], depositNode.sender, pool);

        raffleId++;
        depositState.lastDepositId = bytes32(0);
        pool = 0;
        status = RaffleStatus.FINISHED;

        emit RaffleFinished(raffleId - 1);
    }

    function _withdrawLast(bytes32 _depositId) internal {
        uint256 random = randomWords[0] % pool;
        Deposit memory depositNode = depositState.deposits[_depositId];

        require(!depositState.isEmpty(_depositId), "Deposit not found");

        require(
            depositNode.raffleId == raffleId,
            "Deposit is not from this raffle"
        );

        require(
            depositNode.point + depositNode.amount == pool,
            "Wrong order of deposits(points)"
        );

        require(
            depositNode.point <= random && random <= pool,
            "This user is not a winner"
        );

        TransferHelper.safeTransfer(whitelist[0], depositNode.sender, pool);

        raffleId++;
        depositState.lastDepositId = bytes32(0);
        pool = 0;
        status = RaffleStatus.FINISHED;

        emit RaffleFinished(raffleId - 1);
    }

    //TODO remove
    function fulfillRandomWordsTest(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) public {
        randomWords = _randomWords;
        status = RaffleStatus.CLOSED;

        emit RaffleClosed(raffleId);
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(requestId == _requestId, "Fulfillment error");

        randomWords = _randomWords;
        status = RaffleStatus.CLOSED;

        emit RaffleClosed(raffleId);
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function requestRandomWords() public {
        _requestRandomWords();
    }

    function _requestRandomWords() internal {
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({ nativePayment: true })
                )
            })
        );

        emit RequestSent(requestId, NUM_WORDS);
    }

    function checkUpkeep(
        bytes calldata _checkData
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        return (
            block.timestamp > startedAt + timeToClose &&
                status == RaffleStatus.OPEN,
            ""
        );
    }

    function performUpkeep(bytes calldata _performData) external {
        require(
            msg.sender == forwarderAddress,
            "Caller is not the Chainlink Keeper Registry"
        );

        _requestRandomWords();
    }
}
