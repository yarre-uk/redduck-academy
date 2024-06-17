// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Raffle, RaffleStatus } from "./Raffle.sol";
import { TransferHelper } from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import { Deposit } from "./DepositStorage.sol";

contract RaffleExtended is Raffle {
    uint256 public X;
    uint256 public Y;
    uint256 public Z;
    address public founder;
    address public staking;

    event XChanged(uint256 X);
    event YChanged(uint256 Y);
    event ZChanged(uint256 Z);

    function setWaitingForRandomness(
        bool _waitingForRandomness
    ) public onlyOwner {
        waitingForRandomness = _waitingForRandomness;
    }

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

        total = (total * 100000) / pool;
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

    function setX(uint256 _X) public onlyOwner {
        X = _X;
        emit XChanged(_X);
    }

    function setY(uint256 _Y) public onlyOwner {
        Y = _Y;
        emit YChanged(_Y);
    }

    function setZ(uint256 _Z) public onlyOwner {
        Z = _Z;
        emit ZChanged(_Z);
    }

    function setFounder(address _founder) public onlyOwner {
        founder = _founder;
    }

    function setStaking(address _staking) public onlyOwner {
        staking = _staking;
    }

    function _concludeWithdraw(Deposit storage depositNode) internal override {
        require(X + Y + Z == 100000, "Invalid distribution");

        TransferHelper.safeTransfer(whitelist[0], staking, (pool * X) / 100000);
        TransferHelper.safeTransfer(whitelist[0], founder, (pool * Y) / 100000);
        TransferHelper.safeTransfer(
            whitelist[0],
            depositNode.sender,
            (pool * Z) / 100000
        );

        raffleId++;
        depositState.lastDepositId = bytes32(0);
        pool = 0;
        status = RaffleStatus.FINISHED;

        emit RaffleFinished(raffleId - 1);
    }
}
