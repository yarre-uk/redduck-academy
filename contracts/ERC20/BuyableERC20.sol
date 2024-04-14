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
    string memory symbol,
    uint8 decimals
  ) VotingERC20(_initialSupply, _initialPrice, _name, symbol, decimals) {}

  function buy() public payable {
    require(!hasVote[msg.sender], "You have voted");
    require(msg.value > 0, "Ether value must be greater than 0");
    uint amount = msg.value.div(price);
    _mint(msg.sender, amount);
    _balance = _balance.add(msg.value);
  }

  function sell(uint amount) public {
    require(amount > 0, "Amount must be greater than 0");
    require(!hasVote[msg.sender], "You have voted");
    require(_balances[msg.sender] >= amount, "Insufficient balance");
    uint value = amount.mul(price);
    _burn(msg.sender, amount);
    payable(msg.sender).transfer(value);
    _balance = _balance.sub(value);
  }

  function setFeePercentage(uint percentage) public onlyOwner {
    require(percentage <= 100, "Percentage must be between 0 and 100");
    _feePercentage = percentage;
  }

  // function collectAndBurnFee() public onlyOwner {
  //   require(!isVoting, "Voting is still in progress");
  //   uint fee = (_balance * _feePercentage) / 100;
  //   _burn(address(this), fee);
  //   _balance -= fee;
  // }
}
