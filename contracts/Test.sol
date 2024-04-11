// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract Test {
  uint public balance;
  address public owner;

  event DepositEvent(address indexed _from, uint _amount);
  event WithdrawEvent(address indexed _to, uint _amount);

  constructor() {
    owner = msg.sender;
  }

  function deposit() public payable {
    balance += msg.value;
    emit DepositEvent(msg.sender, msg.value);
  }

  function withdraw(uint _amount) public {
    require(_amount <= balance, "Insufficient balance");
    balance -= _amount;
    payable(msg.sender).transfer(_amount);
    emit WithdrawEvent(msg.sender, _amount);
  }
}
