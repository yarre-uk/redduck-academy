// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./ERC20/BuyableERC20.sol";

contract YarreToken is BuyableERC20 {
  constructor(
    uint _initialSupply,
    uint _initialPrice
  ) BuyableERC20(_initialSupply, _initialPrice, "YarreCoin", "YAR", 18) {}
}
