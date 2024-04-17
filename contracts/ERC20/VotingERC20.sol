// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply
  uint private _leadingPrice = 0;

  uint public constant timeToVote = 1 days;
  uint public voteStartTime;
  bool public isVoting = false;
  uint public votingId;

  mapping(uint => mapping(uint => uint)) public votes;
  mapping(uint => mapping(address => bool)) public hasVoted;

  uint public price;

  event VotingStarted(
    address indexed _address,
    uint indexed _votingId,
    uint _prevPrice
  );
  event VotingEnded(uint indexed _votingId, uint _newPrice);
  event Voted(address indexed _address, uint _price);

  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) BaseERC20(_initialSupply, _name, _symbol, _decimals) {
    price = _initialPrice;
  }

  function _ownsMoreThan(uint _percentage) internal view returns (bool) {
    return _balances[msg.sender] > (_totalSupply * _percentage) / 10000;
  }

  function _startVoting() internal {
    isVoting = true;
    voteStartTime = block.timestamp;
    emit VotingStarted(msg.sender, votingId, price);
  }

  // what if there are multiple prices with the same amount of votes?
  function _updatePrice(uint _price) internal {
    if (votes[votingId][_price] > votes[votingId][_leadingPrice]) {
      _leadingPrice = _price;
    }
  }

  function userPercentage() public view returns (uint) {
    return (_balances[msg.sender] * 10000) / _totalSupply;
  }

  function stopVoting() public {
    require(isVoting, "Voting is not started");
    require(
      block.timestamp >= voteStartTime + timeToVote,
      "Voting time hasn't passed"
    );

    isVoting = false;
    price = _leadingPrice;
    voteStartTime = 0;
    votingId++;
    emit VotingEnded(votingId, _leadingPrice);
  }

  function vote(uint _price) public {
    require(
      _ownsMoreThan(_voteForExistingTokenAmount),
      "Can't vote with such small amount of tokens"
    );
    require(_price > 0, "Price can't be 0");
    require(!hasVoted[votingId][msg.sender], "User has already voted");

    if (userPercentage() > _voteForNewTokenAmount) {
      if (!isVoting) {
        _startVoting();
      }

      votes[votingId][_price] += _balances[msg.sender];
      hasVoted[votingId][msg.sender] = true;

      _updatePrice(_price);

      emit Voted(msg.sender, _price);
      return;
    }

    require(isVoting, "Voting is not started");
    require(votes[votingId][_price] > 0, "Price is not in the voting list");

    votes[votingId][_price] += _balances[msg.sender];
    hasVoted[votingId][msg.sender] = true;

    _updatePrice(_price);

    emit Voted(msg.sender, _price);
  }
}
