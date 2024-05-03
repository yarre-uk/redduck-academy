// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "../YarreToken.sol";
import { Ownable } from "../utils/Ownable.sol";
import { Merkle } from "../utils/Merkle.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Vesting3 is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 public start = block.timestamp;
    uint256 public cliff = 2 * 365 days;

    mapping(uint256 => bool) public usedNonces;
    YarreToken public token;

    constructor(address payable _address) {
        token = YarreToken(_address);
    }

    function claim(
        uint256 _amount,
        uint256 _nonce,
        bytes memory _signature
    ) public {
        require(start + cliff <= block.timestamp, "You cannot claim yet");
        require(token.balanceOf(address(this)) > 0, "No tokens to claim");
        require(!usedNonces[_nonce], "You have already claimed");

        bytes32 message = keccak256(
            abi.encodePacked(msg.sender, _amount, _nonce, address(this))
        );

        require(
            message.toEthSignedMessageHash().recover(_signature) == _owner,
            "Invalid signature"
        );

        usedNonces[_nonce] = true;
        token.transfer(msg.sender, _amount);
    }
}
