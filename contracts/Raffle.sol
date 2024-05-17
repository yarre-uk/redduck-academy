// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "./ERC20/YarreToken.sol";
import { Ownable } from "./utils/Ownable.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { TransferHelper } from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import { DepositStorage } from "./utils/DepositStorage.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

//TODO non reentrant
contract Raffle is DepositStorage {
    address[] internal whitelist;
    address[] internal priceFeedOracles;

    ISwapRouter internal immutable uniswapRouter;
    address public immutable USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    uint256 public raffleId = 0;

    constructor(
        address[] memory _approvedTokens,
        ISwapRouter _uniswapRouter,
        address[] memory _priceFeedOracles
    ) {
        whitelist = _approvedTokens;
        uniswapRouter = _uniswapRouter;
        priceFeedOracles = _priceFeedOracles;
    }

    //TODO permit
    function deposit(uint256 _amount, uint256 _tokenIndex) public {
        require(whitelist[_tokenIndex] != address(0), "Wrong token index");

        uint256 deposited;

        if (whitelist[_tokenIndex] != USDT) {
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

            int256 price = (getLatestPrice(_tokenIndex) * int256(_amount)) /
                1e8;

            uint minPrice = uint(price - (price * int24(poolFee)) / 1e6);

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: whitelist[_tokenIndex],
                    tokenOut: USDT,
                    fee: poolFee,
                    recipient: address(this),
                    deadline: block.timestamp,
                    amountIn: _amount,
                    amountOutMinimum: minPrice,
                    //????
                    sqrtPriceLimitX96: 0
                });

            deposited = uniswapRouter.exactInputSingle(params);
            // console.log("Deposited 1: ", deposited);
        } else {
            TransferHelper.safeTransferFrom(
                USDT,
                msg.sender,
                address(this),
                _amount
            );
            deposited = _amount;
            // console.log("Deposited 2: ", deposited);
        }

        pool += deposited;

        Deposit memory depositDto = Deposit({
            raffleId: raffleId,
            sender: msg.sender,
            amount: deposited,
            point: pool - deposited,
            prevDeposit: lastDepositId
        });

        addNode(depositDto);
    }

    function endRaffle(
        bytes32 depositId,
        bytes32 nextDepositId,
        uint256 random
    ) public onlyOwner {
        //TODO use chainLink VRF
        // uint256 random = uint256(
        //     keccak256(
        //         abi.encodePacked(block.timestamp, depositId, nextDepositId)
        //     )
        // ) % pool;

        Deposit memory depositNode = deposits[depositId];
        Deposit memory nextDepositNode = deposits[nextDepositId];

        require(!isEmpty(depositId), "Deposit not found");
        require(!isEmpty(nextDepositId), "Next deposit not found");

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
            random >= depositNode.point && random < nextDepositNode.point,
            "This user is not a winner"
        );

        TransferHelper.safeTransfer(USDT, depositNode.sender, pool);

        raffleId++;
        lastDepositId = bytes32(0);
        pool = 0;

        console.log("Winner: ", depositNode.sender);
    }

    function getChance(
        bytes32[] memory _ids
    ) public view returns (uint256 total) {
        for (uint256 i = 0; i < _ids.length; i++) {
            total += deposits[_ids[i]].amount;
        }

        total = (total * 1000000) / pool;
    }

    function setWhitelist(address[] memory _approvedTokens) public onlyOwner {
        // will it give some gas?
        delete whitelist;
        whitelist = _approvedTokens;
    }

    function getLatestPrice(uint256 _id) public view returns (int256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedOracles[_id]
        );

        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}
