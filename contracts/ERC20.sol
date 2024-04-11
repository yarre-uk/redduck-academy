// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IERC20.sol";

contract ERC20 is IERC20 {
  address _owner;
  uint private _totalSupply;
  mapping(address => uint) private _balances;
  mapping(address => mapping(address => uint)) private _allowances;

  constructor(uint _initialSupply) {
    _totalSupply = _initialSupply;
    _owner = msg.sender;
    _balances[_owner] = _initialSupply;
  }

  function balanceOf(address account) external view override returns (uint256) {
    return _balances[account];
  }

  function transfer(
    address to,
    uint256 value
  ) external override returns (bool) {
    require(_balances[msg.sender] >= value);
    require(to != address(0));

    _balances[msg.sender] -= value;
    _balances[to] += value;

    emit Transfer(msg.sender, to, value);
    return true;
  }

  function allowance(
    address owner,
    address spender
  ) external view override returns (uint256) {
    return _allowances[owner][spender];
  }

  function approve(
    address spender,
    uint256 value
  ) external override returns (bool) {
    require(spender != address(0));

    _allowances[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external override returns (bool) {
    require(from != address(0));
    require(to != address(0));
    require(_balances[from] >= value);
    require(_allowances[from][to] >= value);

    _balances[from] -= value;
    _allowances[from][to] -= value;
    _balances[to] += value;

    return true;
  }

  function totalSupply() external view override returns (uint256) {
    return _totalSupply;
  }

  function giveSomeTokens(address _to, uint _amount) public {
    require(msg.sender == _owner);
    require(_to != address(0));

    _balances[_to] += _amount;
    _totalSupply += _amount;
    emit Transfer(_owner, _to, _amount);
  }
}
