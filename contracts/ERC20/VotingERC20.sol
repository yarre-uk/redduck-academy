// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { BaseERC20 } from "./BaseERC20.sol";

contract VotingERC20 is BaseERC20 {
    uint256 private _voteForExistingTokenAmount = 5; // 0.05% of total supply
    uint256 private _voteForNewTokenAmount = 10; // 0.1% of total supply
    uint256 private _leadingPrice = 0;

    uint256 public constant TIME_TO_VOTE = 1 days;
    uint256 public voteStartTime;

    bool public isVoting = false;
    uint256 public votingId;
    mapping(uint256 => mapping(uint256 => uint256)) public votes;
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

    function _updatePrice(uint256 _price) internal {
        if (votes[votingId][_price] > votes[votingId][_leadingPrice]) {
            _leadingPrice = _price;
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

        isVoting = false;
        price = _leadingPrice;
        voteStartTime = 0;
        votingId++;
        emit VotingEnded(votingId, price);
    }

    function vote(uint256 _price) public {
        require(
            _ownsMoreThan(_voteForExistingTokenAmount),
            "Can't vote with such small amount of tokens"
        );
        require(_price > 0, "Price can't be 0");
        require(userVote[votingId][msg.sender] == 0, "User has already voted");

        if (userPercentage() > _voteForNewTokenAmount) {
            if (!isVoting) {
                _startVoting();
            }

            votes[votingId][_price] += _balances[msg.sender];
            userVote[votingId][msg.sender] = _price;

            _updatePrice(_price);

            emit Voted(msg.sender, _price);
            return;
        }

        require(isVoting, "Voting is not started");
        require(votes[votingId][_price] > 0, "Price is not in the voting list");

        votes[votingId][_price] += _balances[msg.sender];
        userVote[votingId][msg.sender] = _price;

        _updatePrice(_price);

        emit Voted(msg.sender, _price);
    }

    receive() external payable {
        revert("Ether not accepted");
    }
}
