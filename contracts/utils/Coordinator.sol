// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Raffle } from "../Raffle.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract Coordinator is Raffle {
    constructor(
        address[] memory _approvedTokens,
        address[] memory _priceFeedOracles
    )
        Raffle(
            _approvedTokens,
            ISwapRouter(address(0)),
            _priceFeedOracles,
            0,
            address(0),
            bytes32(0)
        )
    {}
}
