// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract DOS {
    struct Vote {
        address voter;
        uint256 amount;
    }

    uint256 public price;

    mapping(address => uint256) public balances;

    Vote[] public votes;

    modifier canVote() {
        bool _canVote = true;

        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter == msg.sender) {
                _canVote = false;
                break;
            }
        }

        require(_canVote, "Already voted");
        _;
    }

    function deposit() public payable canVote {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) public canVote {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        (bool sent, ) = msg.sender.call{ value: _amount }("");
        require(sent, "Failed to send Ether");
    }

    function vote(uint256 _amount) public canVote {
        require(balances[msg.sender] >= 0, "Insufficient balance");
        votes.push(Vote({ voter: msg.sender, amount: _amount }));
    }

    function concludeVoting() public {
        uint256 total = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            total += votes[i].amount;
        }
        price = total / votes.length;

        delete votes;
    }
}
