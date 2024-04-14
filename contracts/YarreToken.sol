// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./ERC20/VotingERC20.sol";

contract YarreToken is VotingERC20 {
  constructor(
    uint _initialSupply,
    uint _initialPrice
  ) VotingERC20(_initialSupply, _initialPrice, "YarreCoin", "YAR", 18) {}
}
