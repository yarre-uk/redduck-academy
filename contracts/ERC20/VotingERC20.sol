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

  mapping(uint => uint) public votes;
  mapping(uint => uint) public voteKeys;
  uint public votesCount;

  mapping(address => bool) public hasVote;
  mapping(uint => address) public hasVoteKeys;
  uint public hasVotesCount;

  uint public price;

  event VotingStarted(
    address indexed _address,
    uint indexed _votingId,
    uint _prevPrice
  );
  event VotingEnded(uint indexed _votingId, uint _newPrice);
  event Voted(address indexed _address, uint _price);

  using SafeMath for uint;

  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory symbol,
    uint8 decimals
  ) BaseERC20(_initialSupply, _name, symbol, decimals) {
    price = _initialPrice;
  }

  // 1% == 100
  function ownsMoreThan(uint _persentage) internal view returns (bool) {
    return _balances[msg.sender] > (_totalSupply.mul(_persentage)).div(10000);
  }

  function userPersantage() public view returns (uint) {
    return (_balances[msg.sender].mul(10000)).div(_totalSupply);
  }

  function vote(uint _price) public {
    require(
      ownsMoreThan(_voteForExistingTokenAmount),
      "Can't vote with such small amount of tokens"
    );
    require(_price > 0, "Price can't be 0");
    require(!hasVote[msg.sender], "You have already voted");

    // Premium voting
    if (userPersantage() > _voteForNewTokenAmount) {
      // Start voting if it's not started
      if (!isVoting) {
        isVoting = true;
        voteStartTime = block.timestamp;
        votingId++;
        emit VotingStarted(msg.sender, votingId, price);
      }

      // Add new price to voting list
      if (votes[_price] == 0) {
        votes[_price] = _balances[msg.sender];
        voteKeys[votesCount] = _price;
        votesCount++;
      }

      votes[_price] = votes[_price].add(_balances[msg.sender]);
      hasVote[msg.sender] = true;
      hasVoteKeys[hasVotesCount] = msg.sender;
      hasVotesCount++;

      if (votes[_price] > votes[_leadingPrice]) {
        _leadingPrice = _price;
      }

      emit Voted(msg.sender, _price);
      return;
    }

    require(isVoting, "Voting is not started");
    require(votes[_price] > 0, "Price is not in voting list");

    votes[_price] = votes[_price].add(_balances[msg.sender]);
    hasVote[msg.sender] = true;
    hasVoteKeys[hasVotesCount] = msg.sender;
    hasVotesCount++;

    if (votes[_price] > votes[_leadingPrice]) {
      _leadingPrice = _price;
    }

    emit Voted(msg.sender, _price);
  }

  function endVoting() public {
    require(!isVoting, "Voting is still in progress");
    require(
      block.timestamp >= voteStartTime + timeToVote,
      "Voting time is not over"
    );

    for (uint i = 0; i < votesCount; i++) {
      delete votes[voteKeys[i]];
      delete voteKeys[i];
    }
    votesCount = 0;

    for (uint i = votesCount; i < hasVotesCount; i++) {
      hasVote[hasVoteKeys[i]] = false;
      delete hasVoteKeys[i];
    }
    hasVotesCount = 0;

    voteStartTime = block.timestamp;
    isVoting = false;

    emit VotingEnded(votingId, _leadingPrice);
  }
}
