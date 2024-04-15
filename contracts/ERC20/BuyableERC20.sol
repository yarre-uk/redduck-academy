// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./VotingERC20.sol";

contract BuyableERC20 is VotingERC20 {
  uint private _balance = 0;
  uint private _feeBalance = 0;
  uint private _feePercentage = 1; // 0.01%

  using SafeMath for uint;

  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) VotingERC20(_initialSupply, _initialPrice, _name, _symbol, _decimals) {}

  modifier haveNotVoted() {
    require(
      !hasVoted[msg.sender],
      "You have voted, can't buy or sell or transfer"
    );
    _;
  }

  // what if you send ether on now payable function?
  function buy() public payable haveNotVoted {
    require(msg.value > 0, "Ether value must be greater than 0");

    uint amount = msg.value.div(price);
    uint fee = (amount.mul(_feePercentage)).div(10000);

    _mint(msg.sender, amount.sub(fee));
    _balance = _balance.add(msg.value);
    _feeBalance = _feeBalance.add(fee);
  }

  function sell(uint _amount) public haveNotVoted {
    require(_amount > 0, "Amount must be greater than 0");
    require(_balances[msg.sender] >= _amount, "Insufficient balance");

    uint value = _amount.mul(price);
    uint fee = (value.mul(_feePercentage)).div(10000);

    _burn(msg.sender, _amount.sub(fee));
    payable(msg.sender).transfer(value);
    _balance = _balance.sub(value);
    _feeBalance = _feeBalance.add(fee);
  }

  // won't return true, if the user has voted
  // don't know how to fix it using modifier
  function transfer(
    address _to,
    uint256 _value
  ) public override validAddress(_to) haveNotVoted returns (bool) {
    return super.transfer(_to, _value);
  }

  function setFeePercentage(uint percentage) public onlyOwner {
    require(percentage <= 10000, "Percentage must be between 0 and 10000");
    _feePercentage = percentage;
  }

  function collectAndBurnFee() public onlyOwner {
    _feeBalance = 0;
  }

  receive() external payable {
    _balance = _balance.add(msg.value);
  }

  function getBalance() external view onlyOwner returns (uint) {
    return _balance;
  }

  function getFeeBalance() external view onlyOwner returns (uint) {
    return _feeBalance;
  }

  function getFeePercentage() external view onlyOwner returns (uint) {
    return _feePercentage;
  }

  function withdrawBalanceAmount(uint _value) external onlyOwner {
    payable(_owner).transfer(_value);
    _balance = _balance.sub(_value);
  }

  function withdrawBalance() external onlyOwner {
    payable(_owner).transfer(_balance);
    _balance = 0;
  }
}
