// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Ownable {
  address _owner;

  constructor() {
    _owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == _owner);
    _;
  }
}
