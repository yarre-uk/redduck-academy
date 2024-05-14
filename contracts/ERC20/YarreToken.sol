// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { TradableERC20 } from "./TradableERC20.sol";

contract YarreToken is TradableERC20 {
    /**
     * @dev Initializes the contract with the given parameters.
     */
    constructor(
        uint256 _initialSupply,
        uint256 _initialPrice
    ) TradableERC20(_initialSupply, _initialPrice, "YarreCoin", "YAR", 18) {}
}
