// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
  uint private _balance = 0;
  uint private _feeBalance = 0;
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply
  uint private _leadingPrice = 0;
  uint private _feePercentage = 1; // 0.01%

  uint public constant timeToVote = 1 days;
  uint public voteStartTime;
  bool public isVoting = false;
  uint public votingId;
  mapping(uint => uint) public votes;
  mapping(uint => uint) public voteKeys;
  uint public votesCount;

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

      votes[_price] = votes[_price].add(_balances[msg.sender]);

      if (votes[_price] > votes[_leadingPrice]) {
        _leadingPrice = _price;
      }

      emit Voted(msg.sender, _price);
      return;
    }

    require(isVoting, "Voting is not started");

    require(votes[_price] > 0, "Price is not in voting list");

    votes[_price] = votes[_price].add(_balances[msg.sender]);

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
      votes[voteKeys[i]] = 0;
      voteKeys[i] = 0;
    }
    votesCount = 0;
    voteStartTime = block.timestamp;
    isVoting = false;

    emit VotingEnded(votingId, _leadingPrice);
  }

  // function buy() public payable {
  //   require(!isVoting, "Voting is still in progress");
  //   require(msg.value > 0, "Ether value must be greater than 0");
  //   uint fee = (msg.value * _feePercentage) / 100;
  //   uint amount = (msg.value - fee) / price;
  //   _mint(msg.sender, amount);
  //   _balance += msg.value - fee;
  // }

  // function sell(uint amount) public {
  //   require(!isVoting, "Voting is still in progress");
  //   require(amount > 0, "Amount must be greater than 0");
  //   require(_balances[msg.sender] >= amount, "Insufficient balance");
  //   uint fee = (amount * _feePercentage) / 100;
  //   uint value = (amount * price) - fee;
  //   _burn(msg.sender, amount);
  //   payable(msg.sender).transfer(value);
  //   _balance -= value;
  // }

  // function setFeePercentage(uint percentage) public onlyOwner {
  //   require(percentage <= 100, "Percentage must be between 0 and 100");
  //   _feePercentage = percentage;
  // }

  // function collectAndBurnFee() public onlyOwner {
  //   require(!isVoting, "Voting is still in progress");
  //   uint fee = (_balance * _feePercentage) / 100;
  //   _burn(address(this), fee);
  //   _balance -= fee;
  // }
}
