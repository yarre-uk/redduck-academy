// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ReentrancyGuard } from "../utils/ReentrancyGuard.sol";

contract Reentrancy is ReentrancyGuard {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) public nonReentrant returns (bool) {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        (bool success, ) = msg.sender.call{ value: _amount }("");
        return success;
    }

    function withdrawAll() public nonReentrant returns (bool) {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] -= balances[msg.sender];
        (bool success, ) = msg.sender.call{ value: amount }("");
        return success;
    }

    function transfer(address _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }

    // race condition
    function approve(address _spender, uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance");
        require(_amount >= 0, "Invalid amount");
        require(_spender != address(0), "Invalid address");
        require(
            allowances[msg.sender][_spender] == 0 || _amount == 0,
            "Allowance must be 0 before setting new allowance"
        );
        allowances[msg.sender][_spender] = _amount;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public {
        require(balances[_from] >= _amount, "Insufficient balance");
        require(
            allowances[_from][msg.sender] >= _amount,
            "Insufficient allowance"
        );
        balances[_from] -= _amount;
        balances[_to] += _amount;
        allowances[_from][msg.sender] -= _amount;
    }
}
