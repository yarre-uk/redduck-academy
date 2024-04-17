// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./VotingERC20.sol";

contract BuyableERC20 is VotingERC20 {
  uint private _balance = 0;

  uint public feePercentage = 1; // 0.01%

  constructor(
    uint _initialSupply,
    uint _initialPrice,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) VotingERC20(_initialSupply, _initialPrice, _name, _symbol, _decimals) {}

  modifier haveNotVoted() {
    require(
      !hasVoted[votingId][msg.sender],
      "You have voted, can't buy or sell or transfer"
    );
    _;
  }

  function buy() public payable haveNotVoted {
    require(msg.value > 0, "Ether value must be greater than 0");

    uint amount = msg.value * price;
    uint fee = (amount * feePercentage) / 10000;

    require(amount - fee > 0, "You can't buy such a small amount of tokens");

    _mint(msg.sender, amount - fee);
    _mint(address(this), fee);
    _balance += msg.value;
    _balances[address(this)] += fee;
  }

  function sell(uint _amount) public haveNotVoted {
    require(_amount > 0, "Amount must be greater than 0");
    require(_amount <= _balances[msg.sender], "Insufficient balance");

    uint fee = (_amount * feePercentage) / 10000;
    uint value = (_amount - fee) / price;

    _burn(msg.sender, _amount);

    _balance -= value;
    payable(msg.sender).transfer(value);
    _mint(address(this), fee);
    _balances[address(this)] += fee;
  }

  function transfer(
    address _to,
    uint256 _value
  ) public override haveNotVoted returns (bool) {
    return super.transfer(_to, _value);
  }

  function setFeePercentage(uint _percentage) public onlyOwner {
    require(_percentage <= 10000, "Percentage must be between 0 and 10000");
    feePercentage = _percentage;
  }

  function collectAndBurnFee() public onlyOwner {
    _burn(address(this), _balances[address(this)]);
  }

  receive() external payable {
    _balance += msg.value;
  }

  function getBalance() public view onlyOwner returns (uint) {
    return _balance;
  }

  function getFeeBalance() public view onlyOwner returns (uint) {
    return _balances[address(this)];
  }

  function withdrawBalanceAmount(uint _value) public onlyOwner {
    payable(_owner).transfer(_value);
    _balance -= _value;
  }

  function withdrawBalance() public onlyOwner {
    payable(_owner).transfer(_balance);
    _balance = 0;
  }
}
