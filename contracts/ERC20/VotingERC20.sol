// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
  uint private _balance = 0;
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply

  uint public constant timeToVote = 1 days;
  uint public voteStartTime;
  uint[] public votes;
  uint public price;

  constructor(uint _initialSupply) BaseERC20(_initialSupply) {}

  // 1% == 100
  function ownsMoreThan(uint _persentage) internal view returns (bool) {
    return _balances[msg.sender] > (_totalSupply * _persentage) / 10000;
  }

  // modifier canVote() {
  //   require(block.timestamp < voteStartTime + timeToVote);
  //   _;
  // }

  // modifier checkVoteEnding() {
  //   if (voteStartTime + timeToVote < block.timestamp) {}
  // }

  function vote(uint _price) public {
    require(
      ownsMoreThan(_voteForExistingTokenAmount),
      "Can't vote with such small amount of tokens"
    );
  }
}
