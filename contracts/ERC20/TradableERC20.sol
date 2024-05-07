// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { VotingERC20 } from "./VotingERC20.sol";

contract TradableERC20 is VotingERC20 {
    uint256 public feePercentage = 1; // 0.01%

    constructor(
        uint256 _initialSupply,
        uint256 _initialPrice,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) VotingERC20(_initialSupply, _initialPrice, _name, _symbol, _decimals) {}

    // do i need event here?
    function updateVoteOnInteraction(
        bytes32 _newId,
        uint256 _oldAmount
    ) internal {
        require(isVoting, "Voting is not started");
        require(userVote[votingId][msg.sender] != 0, "User has not voted yet");

        uint256 price = userVote[votingId][msg.sender];
        uint256 newAmount = _balances[msg.sender];

        bytes32 oldId = votingList.getId(price);
        uint256 oldListAmount = votingList.getById(oldId).amount;

        votingList.deleteNode(oldId);

        votingList.insert(
            _newId,
            price,
            oldListAmount - _oldAmount + newAmount
        );
    }

    function buy() public payable {
        require(msg.value > 0, "Ether value must be greater than 0");

        uint256 amount = msg.value * price;
        uint256 fee = (amount * feePercentage) / 10000;

        require(
            amount - fee > 0,
            "You can't buy such a small amount of tokens"
        );

        _mint(msg.sender, amount - fee);
        _mint(address(this), fee);
    }

    function buy(bytes32 _id) public payable {
        require(msg.value > 0, "Ether value must be greater than 0");

        uint256 amount = msg.value * price;
        uint256 fee = (amount * feePercentage) / 10000;

        require(
            amount - fee > 0,
            "You can't buy such a small amount of tokens"
        );

        updateVoteOnInteraction(_id, _balances[msg.sender]);

        _mint(msg.sender, amount - fee);
        _mint(address(this), fee);
    }

    function sell(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= _balances[msg.sender], "Insufficient balance");

        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 value = (_amount - fee) / price;

        transferFrom(msg.sender, address(this), _amount);
        _burn(address(this), _amount - fee);

        payable(msg.sender).transfer(value);
    }

    function sell(uint256 _amount, bytes32 _id) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= _balances[msg.sender], "Insufficient balance");

        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 value = (_amount - fee) / price;

        updateVoteOnInteraction(_id, _balances[msg.sender]);

        transferFrom(msg.sender, address(this), _amount);
        _burn(address(this), _amount - fee);

        payable(msg.sender).transfer(value);
    }

    function transfer(
        address _to,
        uint256 _value
    ) public override returns (bool) {
        bool result = super.transfer(_to, _value);

        return result;
    }

    function transfer(
        address _to,
        uint256 _value,
        bytes32 _id
    ) public returns (bool) {
        bool result = super.transfer(_to, _value);

        if (result) {
            updateVoteOnInteraction(_id, _balances[msg.sender]);
        }

        return result;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public override returns (bool) {
        bool result = super.approve(_spender, _value);

        return result;
    }

    function approve(
        address _spender,
        uint256 _value,
        bytes32 _id
    ) public returns (bool) {
        bool result = super.approve(_spender, _value);

        if (result) {
            updateVoteOnInteraction(_id, _balances[msg.sender]);
        }

        return result;
    }

    function setFeePercentage(uint256 _percentage) public onlyOwner {
        require(_percentage <= 10000, "Percentage must be between 0 and 10000");
        feePercentage = _percentage;
    }

    function collectAndBurnFee() public onlyOwner {
        _burn(address(this), _balances[address(this)]);
    }

    function getFeeBalance() public view onlyOwner returns (uint256) {
        return _balances[address(this)];
    }

    function withdrawBalanceAmount(uint256 _value) public onlyOwner {
        payable(_owner).transfer(_value);
    }

    function withdrawBalance() public onlyOwner {
        payable(_owner).transfer(address(this).balance);
    }
}
