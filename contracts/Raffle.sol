// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "./ERC20/YarreToken.sol";
import { Ownable } from "./utils/Ownable.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { TransferHelper } from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import { DepositStorage } from "./utils/DepositStorage.sol";

contract Raffle is DepositStorage {
    address[] internal whitelist;

    ISwapRouter public immutable uniswapRouter;
    address public immutable USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    uint256 public raffleId = 0;

    constructor(address[] memory _approvedTokens, ISwapRouter _uniswapRouter) {
        whitelist = _approvedTokens;
        uniswapRouter = _uniswapRouter;
    }

    function deposit(
        uint256 _amount,
        uint256 _tokenIndex
    ) public returns (uint256 deposited) {
        require(whitelist[_tokenIndex] != address(0), "Wrong token index");

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

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: whitelist[_tokenIndex],
                    tokenOut: USDT,
                    fee: poolFee,
                    recipient: msg.sender,
                    deadline: block.timestamp,
                    amountIn: _amount,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

            deposited = uniswapRouter.exactInputSingle(params);
        } else {
            deposited = _amount;
        }

        pool += deposited;

        Deposit memory depositDto = Deposit({
            raffleId: raffleId,
            sender: msg.sender,
            amount: deposited,
            point: 0,
            prevDeposit: lastDepositId
        });

        addNode(depositDto);
    }

    function endRaffle(
        bytes32 depositId,
        bytes32 nextDepositId
    ) public onlyOwner {
        //TODO use chainLink VRF
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, depositId, nextDepositId)
            )
        ) % pool;

        Deposit storage depositNode = deposits[depositId];
        Deposit storage nextDepositNode = deposits[nextDepositId];

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
            depositNode.sender != nextDepositNode.sender,
            "Same sender, Wha???"
        );

        require(
            random >= depositNode.point && random < nextDepositNode.point,
            "This user is not a winner"
        );

        raffleId++;
        lastDepositId = bytes32(0);
    }

    function setWhitelist(address[] memory _approvedTokens) public onlyOwner {
        // will it give some gas?
        delete whitelist;
        whitelist = _approvedTokens;
    }
}
