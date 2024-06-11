// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Raffle } from "./Raffle.sol";
import { Deposit } from "./DepositStorage.sol";

contract RaffleExtended is Raffle {
    function setForwarderAddress(address _forwarderAddress) external onlyOwner {
        forwarderAddress = _forwarderAddress;
    }

    function setWhitelist(address[] memory _whitelist) public onlyOwner {
        whitelist = _whitelist;
    }

    function getChance(
        bytes32[] memory _ids
    ) public view returns (uint256 total) {
        for (uint256 i = 0; i < _ids.length; i++) {
            total += depositState.deposits[_ids[i]].amount;
        }

        total = (total * 1000000) / pool;
    }

    function getDeposit(bytes32 _id) public view returns (Deposit memory) {
        return depositState.deposits[_id];
    }

    function getDeposits(
        bytes32[] memory _ids
    ) public view returns (Deposit[] memory) {
        Deposit[] memory deposits = new Deposit[](_ids.length);

        for (uint256 i = 0; i < deposits.length; i++) {
            deposits[i] = depositState.deposits[_ids[i]];
        }

        return deposits;
    }
}
