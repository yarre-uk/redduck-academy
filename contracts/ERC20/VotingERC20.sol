// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./BaseERC20.sol";

/// @title VotingERC20
/// @dev This contract extends BaseERC20 to allow for voting on token price.
/// @notice This contract allows for voting on the price of the token.
contract VotingERC20 is BaseERC20 {
  /// @notice The amount of tokens a user must own to vote for an existing token price.
  uint private _voteForExistingTokenAmount = 5; // 0.05% of total supply

  /// @notice The amount of tokens a user must own to vote for a new token price.
  uint private _voteForNewTokenAmount = 10; // 0.1% of total supply

  /// @notice The leading price in the current vote.
  uint private _leadingPrice = 0;

  /// @notice The time allowed for a vote.
  uint public constant timeToVote = 1 days;

  /// @notice The start time of the current vote.
  uint public voteStartTime;

  /// @notice Whether a vote is currently in progress.
  bool public isVoting = false;

  /// @notice The ID of the current vote.
  uint public votingId;

  /// @notice The votes for each price in each vote.
  mapping(uint => mapping(uint => uint)) public votes;

  /// @notice Whether each user has voted in each vote.
  mapping(uint => mapping(address => bool)) public hasVoted;

  /// @notice The current price of the token.
  uint public price;

  /// @dev Emitted when a vote starts.
  event VotingStarted(
    address indexed _address,
    uint indexed _votingId,
    uint _prevPrice
  );

  /// @dev Emitted when a vote ends.
  event VotingEnded(uint indexed _votingId, uint _newPrice);

  /// @dev Emitted when a user votes.
  event Voted(address indexed _address, uint _price);

  /// @dev Initializes the contract with initial supply, price, name, symbol, and decimals.
  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) BaseERC20(_initialSupply, _name, _symbol, _decimals) {
    price = _initialPrice;
  }

  /// @dev Returns whether the sender owns more than a certain percentage of the total supply.
  function _ownsMoreThan(uint _percentage) internal view returns (bool) {
    return _balances[msg.sender] > (_totalSupply * _percentage) / 10000;
  }

  /// @dev Starts a vote.
  function _startVoting() internal {
    isVoting = true;
    voteStartTime = block.timestamp;
    emit VotingStarted(msg.sender, votingId, price);
  }

  /// @dev Updates the leading price in the current vote.
  function _updatePrice(uint _price) internal {
    if (votes[votingId][_price] > votes[votingId][_leadingPrice]) {
      _leadingPrice = _price;
    }
  }

  /// @notice Returns the percentage of the total supply owned by the sender.
  function userPercentage() public view returns (uint) {
    return (_balances[msg.sender] * 10000) / _totalSupply;
  }

  /// @notice Stops the current vote.
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
    emit VotingEnded(votingId, price);
  }

  /// @notice Votes for a price.
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
