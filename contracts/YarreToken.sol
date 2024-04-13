// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ERC20.sol";

contract YarreToken is ERC20 {
  constructor(uint _initialSupply) ERC20(_initialSupply) {}

  function name() public pure override returns (string memory) {
    return "YarreToken";
  }

  function symbol() public pure override returns (string memory) {
    return "YAR";
  }
}
