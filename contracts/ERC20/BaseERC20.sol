// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "./IERC20.sol";
import { Ownable } from "../utils/Ownable.sol";

/// @title BaseERC20
/// @dev This contract implements the basic functionality of an ERC20 token.
/// It includes the standard ERC20 functions and some additional ones.
/// It is abstract and should be inherited by a concrete implementation.
abstract contract BaseERC20 is IERC20, Ownable {
  /// @notice The total supply of the token.
  uint256 internal _totalSupply;

  /// @notice The balance of each account.
  mapping(address => uint256) internal _balances;

  /// @notice The allowance of each account to another.
  mapping(address => mapping(address => uint256)) internal _allowances;

  /// @notice The name of the token.
  string public name;

  /// @notice The symbol of the token.
  string public symbol;

  /// @notice The number of decimals the token uses.
  uint8 public decimals;

  /// @dev Initializes the contract with the initial supply, name, symbol, and decimals.
  constructor(
    uint256 _initialSupply,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) {
    _totalSupply = _initialSupply;
    _owner = msg.sender;
    _balances[_owner] = _initialSupply;
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  /// @dev Modifier to check that the address is not zero.
  modifier validAddress(address _address) {
    require(_address != address(0), "Invalid address");
    _;
  }

  /// @notice Returns the balance of the specified account.
  function balanceOf(address account) public view override returns (uint256) {
    return _balances[account];
  }

  /// @notice Transfers tokens from the caller to the specified address.
  function transfer(
    address to,
    uint256 value
  ) public virtual validAddress(to) returns (bool) {
    require(_balances[msg.sender] >= value, "Insufficient balance");

    _balances[msg.sender] = _balances[msg.sender] - value;
    _balances[to] = _balances[to] + value;

    emit Transfer(msg.sender, to, value);
    return true;
  }

  /// @notice Returns the allowance of the owner to the spender.
  function allowance(
    address owner,
    address spender
  ) public view override returns (uint256) {
    return _allowances[owner][spender];
  }

  /// @notice Approves the spender to spend the specified amount of tokens on behalf of the caller.
  function approve(
    address spender,
    uint256 value
  ) public virtual validAddress(spender) returns (bool) {
    _allowances[msg.sender][spender] = 0;
    _allowances[msg.sender][spender] = value;

    emit Approval(msg.sender, spender, value);
    return true;
  }

  /// @notice Transfers tokens from one address to another, using the allowance mechanism.
  function transferFrom(
    address from,
    address to,
    uint256 value
  ) public virtual override validAddress(from) validAddress(to) returns (bool) {
    require(_balances[from] >= value, "Insufficient balance");
    require(_allowances[from][to] >= value, "Insufficient allowance");

    _balances[from] = _balances[from] - value;
    _allowances[from][to] = _allowances[from][to] - value;
    _balances[to] = _balances[to] + value;

    emit Transfer(from, to, value);
    return true;
  }

  /// @notice Returns the total supply of tokens.
  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  /// @dev Mints new tokens to the specified address.
  function _mint(
    address _address,
    uint256 _amount
  ) internal validAddress(_address) {
    _totalSupply = _totalSupply + _amount;
    _balances[_address] = _balances[_address] + _amount;

    emit Transfer(address(0), _address, _amount);
  }

  /// @dev Burns tokens from the specified address.
  function _burn(
    address _address,
    uint256 _amount
  ) internal validAddress(_address) {
    _balances[_address] = _balances[_address] - _amount;
    _totalSupply = _totalSupply - _amount;

    emit Transfer(address(0), _address, _amount);
  }
}
