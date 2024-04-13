// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IERC20.sol";
import "../utils/Ownable.sol";
import "../utils/Math.sol";

abstract contract BaseERC20 is IERC20, Ownable {
  uint internal _totalSupply;

  mapping(address => uint) internal _balances;
  mapping(address => mapping(address => uint)) internal _allowances;

  using Math for uint;

  constructor(uint _initialSupply) {
    _totalSupply = _initialSupply;
    _owner = msg.sender;
    _balances[_owner] = _initialSupply;
  }

  modifier validAddress(address _address) {
    require(_address != address(0));
    _;
  }

  function balanceOf(address account) external view override returns (uint256) {
    return _balances[account];
  }

  function transfer(
    address to,
    uint256 value
  ) external override validAddress(to) returns (bool) {
    require(_balances[msg.sender] >= value);

    (, _balances[msg.sender]) = _balances[msg.sender].trySub(value);
    (, _balances[to]) = _balances[to].tryAdd(value);

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

    (, _balances[from]) = _balances[from].trySub(value);
    (, _allowances[from][to]) = _allowances[from][to].trySub(value);
    (, _balances[to]) = _balances[to].tryAdd(value);

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
    (, _balances[_to]) = _balances[_to].tryAdd(_amount);
    (, _totalSupply) = _totalSupply.tryAdd(_amount);

    emit Transfer(_owner, _to, _amount);
  }

  function name() public pure virtual returns (string memory) {}

  function symbol() public pure virtual returns (string memory) {}

  function decimals() public pure virtual returns (uint8) {}
}
