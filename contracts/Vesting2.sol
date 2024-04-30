// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "./YarreToken.sol";
import { Ownable } from "./utils/Ownable.sol";
import { Merkle } from "./utils/Merkle.sol";

contract Vesting2 is Ownable, Merkle {
    uint256 public start = block.timestamp;
    uint256 public cliff = 2 * 365 days;

    bytes32 public root;

    mapping(address => bool) public claimedAddresses;

    YarreToken public token;

    constructor(address payable _address) {
        token = YarreToken(_address);
    }

    function claim(bytes32[] memory _proof) public {
        require(start + cliff <= block.timestamp, "You cannot claim yet");
        require(token.balanceOf(address(this)) > 0, "No tokens to claim");
        require(!claimedAddresses[msg.sender], "You have already claimed");

        Merkle.checkProof(
            root,
            keccak256(abi.encodePacked(msg.sender)),
            _proof
        );

        claimedAddresses[msg.sender] = true;
        token.transfer(msg.sender, 10000);
    }

    function setRoot(bytes32 _root) public onlyOwner {
        root = _root;
    }
}
