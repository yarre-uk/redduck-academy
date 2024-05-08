// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { VotingERC20 } from "./VotingERC20.sol";
import "hardhat/console.sol";

contract TradableERC20 is VotingERC20 {
    uint256 public feePercentage = 1; // 0.01%

    constructor(
        uint256 _initialSupply,
        uint256 _initialPrice,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) VotingERC20(_initialSupply, _initialPrice, _name, _symbol, _decimals) {}

    modifier hasNotVoted() {
        require(
            userVote[votingId][msg.sender] == 0,
            "Can't use this functions after voting"
        );
        _;
    }

    // do i need event here?
    function updateVoteOnInteraction(
        bytes32 _prevId,
        address _user,
        uint256 _prevAmount,
        uint256 _price
    ) internal {
        require(isVoting, "Voting is not started");
        require(userVote[votingId][_user] != 0, "User has not voted yet");

        uint256 newAmount = _balances[_user];

        bytes32 oldId = getId(votingId, _price);
        uint256 oldListAmount = getById(oldId).amount;

        deleteNode(oldId);

        // console.log(_price, oldListAmount, _prevAmount, newAmount);

        // console.logBytes32(oldId);
        // console.logUint(price);
        // console.logUint(oldListAmount - oldAmount + _newAmount);

        insert(
            votingId,
            _prevId,
            _price,
            oldListAmount - _prevAmount + newAmount
        );

        if (getTail() == getId(votingId, _price)) {
            _leadingPrice = _price;
        } else {
            _leadingPrice = getById(getTail()).price;
        }
    }

    function buy() public payable hasNotVoted {
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

    function sell(uint256 _amount) public hasNotVoted {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= _balances[msg.sender], "Insufficient balance");

        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 value = (_amount - fee) / price;

        transferFrom(msg.sender, address(this), _amount);
        _burn(address(this), _amount - fee);

        payable(msg.sender).transfer(value);
    }

    function transfer(
        address _to,
        uint256 _value
    ) public override hasNotVoted returns (bool) {
        bool result = super.transfer(_to, _value);

        return result;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public override hasNotVoted returns (bool) {
        bool result = super.transferFrom(_from, _to, _value);

        return result;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public override returns (bool) {
        bool result = super.approve(_spender, _value);

        return result;
    }

    function buy(bytes32 _id) public payable {
        require(msg.value > 0, "Ether value must be greater than 0");

        uint256 amount = msg.value * price;
        uint256 fee = (amount * feePercentage) / 10000;

        require(
            amount - fee > 0,
            "You can't buy such a small amount of tokens"
        );

        _mint(msg.sender, amount - fee);
        _mint(address(this), fee);

        updateVoteOnInteraction(
            _id,
            msg.sender,
            _balances[msg.sender] - (amount - fee),
            userVote[votingId][msg.sender]
        );
    }

    function transferFromInternal(
        address _from,
        address _to,
        uint256 _value
    ) internal returns (bool) {
        bool result = super.transferFrom(_from, _to, _value);

        return result;
    }

    function sell(uint256 _amount, bytes32 _id) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= _balances[msg.sender], "Insufficient balance");

        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 value = (_amount - fee) / price;

        transferFromInternal(msg.sender, address(this), _amount);
        _burn(address(this), _amount - fee);

        payable(msg.sender).transfer(value);

        updateVoteOnInteraction(
            _id,
            msg.sender,
            _balances[msg.sender] + _amount,
            userVote[votingId][msg.sender]
        );
    }

    function transfer(
        address _to,
        uint256 _value,
        bytes32 _id1,
        bytes32 _id2
    ) public returns (bool) {
        bool result = super.transfer(_to, _value);

        if (result) {
            updateVoteOnInteraction(
                _id1,
                msg.sender,
                _balances[msg.sender] + _value,
                userVote[votingId][msg.sender]
            );

            if (userVote[votingId][_to] != 0) {
                updateVoteOnInteraction(
                    _id2,
                    _to,
                    _balances[_to] - _value,
                    userVote[votingId][_to]
                );
            }
        }

        return result;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes32 _id1,
        bytes32 _id2
    ) public returns (bool) {
        bool result = super.transferFrom(_from, _to, _value);

        // console.log("->>", _value);
        // console.log("->>", _balances[_from]);
        // console.log("->>", _balances[_to]);

        if (result) {
            updateVoteOnInteraction(
                _id1,
                _from,
                _balances[_from] + _value,
                userVote[votingId][_from]
            );

            if (userVote[votingId][_to] != 0) {
                updateVoteOnInteraction(
                    _id2,
                    _to,
                    _balances[_to] - _value,
                    userVote[votingId][_to]
                );
            }
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
