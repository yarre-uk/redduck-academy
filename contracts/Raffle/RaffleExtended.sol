// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Raffle } from "./Raffle.sol";

contract RaffleExtended is Raffle {
    function setWhitelist(address[] memory _approvedTokens) public onlyOwner {
        whitelist = _approvedTokens;
    }

    function setPoolFee(uint24 _poolFee) public onlyOwner {
        poolFee = _poolFee;
    }

    function getChance(
        bytes32[] memory _ids
    ) public view returns (uint256 total) {
        for (uint256 i = 0; i < _ids.length; i++) {
            total += deposits[_ids[i]].amount;
        }

        total = (total * 1000000) / pool;
    }
}
