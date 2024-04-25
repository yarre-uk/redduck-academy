// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract DOS {
    uint256 private _leadingPrice;

    uint256 public price;
    uint256 votingId = 0;

    mapping(address => uint256) public balances;
    mapping(uint => mapping(uint256 => uint256)) votes;
    mapping(uint => mapping(address => bool)) userVoted;

    modifier canInteract() {
        require(userVoted[votingId][msg.sender] == false, "Already voted");
        _;
    }

    function deposit() public payable canInteract {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) public canInteract {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        (bool sent, ) = msg.sender.call{ value: _amount }("");
        require(sent, "Failed to send Ether");
    }

    function vote(uint256 _newPrice) public canInteract {
        require(balances[msg.sender] >= 0, "Insufficient balance");
        require(_newPrice >= 0, "Invalid price");

        votes[votingId][_newPrice] = balances[msg.sender];
        userVoted[votingId][msg.sender] = true;

        if (votes[votingId][_newPrice] > votes[votingId][_leadingPrice]) {
            _leadingPrice = _newPrice;
        }
    }

    function concludeVoting() public {
        votingId++;
        price = _leadingPrice;
        _leadingPrice = 0;
    }
}
