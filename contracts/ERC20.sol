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

  modifier onlyOwner() {
    require(msg.sender == _owner);
    _;
  }

  modifier validAddress(address _address) {
    require(_address != address(0));
    _;
  }

  function name() public pure returns (string memory) {
    return "YarreToken";
  }

  function symbol() public pure returns (string memory) {
    return "YAR";
  }

  function decimals() public pure returns (uint8) {
    return 1;
  }

  function balanceOf(address account) external view override returns (uint256) {
    return _balances[account];
  }

  function transfer(
    address to,
    uint256 value
  ) external override validAddress(to) returns (bool) {
    require(_balances[msg.sender] >= value);

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
  ) external override validAddress(spender) returns (bool) {
    _allowances[msg.sender][spender] = 0;
    _allowances[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external override validAddress(from) validAddress(to) returns (bool) {
    require(_balances[from] >= value);
    require(_allowances[from][to] >= value);

    _balances[from] -= value;
    _allowances[from][to] -= value;
    _balances[to] += value;

    emit Transfer(from, to, value);
    return true;
  }

  function totalSupply() external view override returns (uint256) {
    return _totalSupply;
  }

  function giveSomeTokens(
    address _to,
    uint _amount
  ) public validAddress(_to) onlyOwner {
    _balances[_to] += _amount;
    _totalSupply += _amount;
    emit Transfer(_owner, _to, _amount);
  }
}
