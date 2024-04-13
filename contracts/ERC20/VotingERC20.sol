// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
  uint private _balance = 0;
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply
  uint private _leadingPrice = 0;

  uint public constant timeToVote = 1 days;
  uint public voteStartTime;
  bool public isVoting = false;
  mapping(uint => uint) public votes;
  mapping(uint => uint) public voteKeys;
  uint public votesCount;

  uint public leadingPrice;
  uint public price;
  uint public votingId;

  event VotingStarted(
    address indexed _address,
    uint indexed _votingId,
    uint _prevPrice
  );
  event VotingEnded(uint indexed _votingId, uint _newPrice);
  event Voted(address indexed _address, uint _price);

  constructor(uint _initialSupply, uint _price) BaseERC20(_initialSupply) {
    price = _price;
  }

  // 1% == 100
  function ownsMoreThan(uint _persentage) internal view returns (bool) {
    return _balances[msg.sender] > (_totalSupply * _persentage) / 10000;
  }

  function userPersantage() public view returns (uint) {
    return (_balances[msg.sender] * 10000) / _totalSupply;
  }

  modifier checkVoteEnding() {
    if (voteStartTime + timeToVote < block.timestamp) {
      for (uint i = 0; i < votesCount; i++) {
        votes[voteKeys[i]] = 0;
        voteKeys[i] = 0;
      }
      votesCount = 0;

      voteStartTime = block.timestamp;
      isVoting = false;
      emit VotingEnded(votingId, _leadingPrice);
    }
    _;
  }

  function vote(uint _price) public {
    require(
      ownsMoreThan(_voteForExistingTokenAmount),
      "Can't vote with such small amount of tokens"
    );

    // premium vote
    if (userPersantage() > _voteForNewTokenAmount) {
      require(_price > 0, "Price can't be 0");

      if (!isVoting) {
        isVoting = true;
        voteStartTime = block.timestamp;
        votingId++;
        emit VotingStarted(msg.sender, votingId, price);
      }

      if (votes[_price] == 0) {
        voteKeys[votesCount] = _price;
        votesCount++;
      }

      votes[_price] = votes[_price] + _balances[msg.sender];

      if (votes[_price] > votes[_leadingPrice]) {
        _leadingPrice = _price;
      }

      emit Voted(msg.sender, _price);
      return;
    }

    require(isVoting, "Voting is not started");

    require(votes[_price] > 0, "Price is not in voting list");

    votes[_price] = votes[_price] + _balances[msg.sender];

    if (votes[_price] > votes[_leadingPrice]) {
      _leadingPrice = _price;
    }

    emit Voted(msg.sender, _price);
  }
}
