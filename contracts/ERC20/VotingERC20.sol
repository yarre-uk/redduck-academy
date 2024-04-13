// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
  uint private _balance = 0;
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply

  uint public constant timeToVote = 1 days;

  uint public voteStartTime;

  constructor(uint _initialSupply) BaseERC20(_initialSupply) {
    voteStartTime = block.timestamp;
  }

  // 1% == 100
  modifier ownsMoreThan(uint _persentage) {
    require((_totalSupply * _persentage) / 100 < _balances[msg.sender]);
    _;
  }

  function vote(uint price) public {
    // some voting logic
  }
}
