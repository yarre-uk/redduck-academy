// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./VotingERC20.sol";

/// @title TradableERC20
/// @dev This contract extends VotingERC20 to allow for trading with a fee.
/// @notice This contract allows for buying, selling, transferring, and approving tokens.
contract TradableERC20 is VotingERC20 {
  /// @notice The fee percentage for each transaction.
  uint public feePercentage = 1; // 0.01%

  /// @dev Initializes the contract with initial supply, price, name, symbol, and decimals.
  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) VotingERC20(_initialSupply, _initialPrice, _name, _symbol, _decimals) {}

  /// @dev Modifier to make a function callable only when the sender has not voted.
  modifier haveNotVoted() {
    require(
      !hasVoted[votingId][msg.sender],
      "You have voted, cannot buy or sell, transfer or approve"
    );
    _;
  }

  /// @notice Buy tokens with Ether.
  function buy() public payable haveNotVoted {
    require(msg.value > 0, "Ether value must be greater than 0");

    uint amount = msg.value * price;
    uint fee = (amount * feePercentage) / 10000;

    require(amount - fee > 0, "You can't buy such a small amount of tokens");

    _mint(msg.sender, amount - fee);
    _mint(address(this), fee);
  }

  /// @notice Sell tokens for Ether.
  function sell(uint _amount) public haveNotVoted {
    require(_amount > 0, "Amount must be greater than 0");
    require(_amount <= _balances[msg.sender], "Insufficient balance");

    uint fee = (_amount * feePercentage) / 10000;
    uint value = (_amount - fee) / price;

    transferFrom(msg.sender, address(this), _amount);
    _burn(address(this), _amount - fee);

    payable(msg.sender).transfer(value);
  }

  /// @notice Transfer tokens to another address.
  function transfer(
    address _to,
    uint256 _value
  ) public override haveNotVoted returns (bool) {
    console.log("transfer", hasVoted[votingId][msg.sender]);
    return super.transfer(_to, _value);
  }

  /// @notice Approve another address to spend tokens.
  function approve(
    address _spender,
    uint256 _value
  ) public override haveNotVoted returns (bool) {
    console.log("approve", hasVoted[votingId][msg.sender]);
    return super.approve(_spender, _value);
  }

  /// @notice Set the fee percentage.
  function setFeePercentage(uint _percentage) public onlyOwner {
    require(_percentage <= 10000, "Percentage must be between 0 and 10000");
    feePercentage = _percentage;
  }

  /// @notice Collect and burn the fee.
  function collectAndBurnFee() public onlyOwner {
    _burn(address(this), _balances[address(this)]);
  }

  /// @notice Receive Ether.
  receive() external payable {
    payable(address(this)).transfer(msg.value);
  }

  /// @notice Get the fee balance.
  function getFeeBalance() public view onlyOwner returns (uint) {
    return _balances[address(this)];
  }

  /// @notice Withdraw a specific amount of Ether.
  function withdrawBalanceAmount(uint _value) public onlyOwner {
    payable(_owner).transfer(_value);
  }

  /// @notice Withdraw all Ether.
  function withdrawBalance() public onlyOwner {
    payable(_owner).transfer(address(this).balance);
  }
}
