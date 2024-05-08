// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VotingLinkedList, Data } from "../utils/VotingLinkedList.sol";
import { BaseERC20 } from "./BaseERC20.sol";
import "hardhat/console.sol";

contract VotingERC20 is BaseERC20, VotingLinkedList {
    uint256 private _voteForExistingTokenAmount = 5; // 0.05% of total supply
    uint256 private _voteForNewTokenAmount = 10; // 0.1% of total supply
    // must be private
    uint256 public _leadingPrice = 0;

    uint256 public constant TIME_TO_VOTE = 1 days;
    uint256 public voteStartTime;

    bool public isVoting = false;
    uint256 public votingId;
    mapping(uint256 => mapping(address => uint256)) public userVote;
    uint256 public price;

    event VotingStarted(
        address indexed _address,
        uint256 indexed _votingId,
        uint256 _prevPrice
    );

    event VotingEnded(uint256 indexed _votingId, uint256 _newPrice);

    event Voted(address indexed _address, uint256 _price);

    constructor(
        uint256 _initialSupply,
        uint256 _initialPrice,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) BaseERC20(_initialSupply, _name, _symbol, _decimals) {
        price = _initialPrice;
    }

    function _ownsMoreThan(uint256 _percentage) internal view returns (bool) {
        return _balances[msg.sender] > (_totalSupply * _percentage) / 10000;
    }

    function _startVoting() internal {
        isVoting = true;
        voteStartTime = block.timestamp;
        emit VotingStarted(msg.sender, votingId, price);
    }

    function _updateList(
        uint256 _price,
        uint256 _amount,
        bytes32 _id
    ) internal {
        bytes32 checkId = getId(votingId, _price);
        bytes32 leadingId = getId(votingId, _leadingPrice);

        require(
            leadingId == getTail() || _leadingPrice == 0,
            "Leading price is not the tail"
        );

        Data memory data = getById(checkId);

        if (data.price == _price) {
            deleteNode(checkId);
        }

        if (_id == leadingId || _id == bytes32(0)) {
            // console.log("push", _leadingPrice, _price, _amount);
            push(votingId, _price, _amount);
            _leadingPrice = _price;
        } else {
            // console.log("insert", _leadingPrice, _price, _amount);
            insert(votingId, _id, _price, _amount);

            if (getTail() == checkId) {
                _leadingPrice = _price;
            } else {
                _leadingPrice = getById(getTail()).price;
            }
        }
    }

    function userPercentage() public view returns (uint256) {
        return (_balances[msg.sender] * 10000) / _totalSupply;
    }

    function stopVoting() public {
        require(isVoting, "Voting is not started");
        require(
            block.timestamp >= voteStartTime + TIME_TO_VOTE,
            "Voting time hasn't passed"
        );

        bytes32 tail = getTail();
        Data memory data = getById(tail);

        require(data.price == _leadingPrice, "Leading price is not the tail");

        isVoting = false;
        price = _leadingPrice;
        _leadingPrice = 0;
        voteStartTime = 0;
        votingId++;
        clear();
        emit VotingEnded(votingId, price);
    }

    //TODO delete previous votes
    function vote(uint256 _price, bytes32 voteId) public {
        require(
            _ownsMoreThan(_voteForExistingTokenAmount),
            "Can't vote with such small amount of tokens"
        );
        require(_price > 0, "Price can't be 0");
        require(userVote[votingId][msg.sender] == 0, "User has already voted");

        uint256 amount = _balances[msg.sender];

        if (userPercentage() > _voteForNewTokenAmount) {
            if (!isVoting) {
                _startVoting();
            }

            userVote[votingId][msg.sender] = _price;

            _updateList(_price, amount, voteId);

            emit Voted(msg.sender, _price);
            return;
        }

        require(isVoting, "Voting is not started");
        require(
            isNotEmpty(getId(votingId, _price)),
            "Price is not in the voting list"
        );

        userVote[votingId][msg.sender] = _price;

        _updateList(_price, amount, voteId);

        emit Voted(msg.sender, _price);
    }

    receive() external payable {
        revert("Ether not accepted");
    }
}
