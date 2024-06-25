// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "./IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BaseERC20 is IERC20, Ownable {
    uint256 internal _totalSupply;
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) internal _allowances;

    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(
        uint256 _initialSupply,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) Ownable(msg.sender) {
        _totalSupply = _initialSupply;
        _balances[owner()] = _initialSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

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

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        uint256 value
    ) public virtual validAddress(spender) returns (bool) {
        _allowances[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        public
        virtual
        override
        validAddress(from)
        validAddress(to)
        returns (bool)
    {
        require(_balances[from] >= value, "Insufficient balance");
        require(_allowances[from][to] >= value, "Insufficient allowance");

        _balances[from] = _balances[from] - value;
        _allowances[from][to] = _allowances[from][to] - value;
        _balances[to] = _balances[to] + value;

        emit Transfer(from, to, value);
        return true;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function _mint(
        address _address,
        uint256 _amount
    ) internal validAddress(_address) {
        _totalSupply = _totalSupply + _amount;
        _balances[_address] = _balances[_address] + _amount;

        emit Transfer(address(0), _address, _amount);
    }

    function _burn(
        address _address,
        uint256 _amount
    ) internal validAddress(_address) {
        _balances[_address] = _balances[_address] - _amount;
        _totalSupply = _totalSupply - _amount;

        emit Transfer(address(0), _address, _amount);
    }
}
