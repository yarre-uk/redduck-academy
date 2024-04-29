// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "./YarreToken.sol";
import { Ownable } from "./utils/Ownable.sol";

contract Vesting1 is Ownable {
    uint256 public start = block.timestamp;
    uint256 public cliff = 2 * 365 days;
    mapping(address => bool) public canClaim;

    YarreToken public token;

    constructor(address payable _address) {
        token = YarreToken(_address);
    }

    function claim() public {
        require(start + cliff <= block.timestamp, "You cannot claim yet");
        require(token.balanceOf(address(this)) > 0, "No tokens to claim");
        require(canClaim[msg.sender], "You cannot claim");

        token.transfer(msg.sender, 10000);
        canClaim[msg.sender] = false;
    }

    function addAddress(address _address) public onlyOwner {
        canClaim[_address] = true;
    }
}
