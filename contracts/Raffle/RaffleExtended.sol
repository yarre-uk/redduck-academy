// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Raffle, RaffleStatus } from "./Raffle.sol";
import { Deposit } from "./DepositStorage.sol";

import { TransferHelper } from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "hardhat/console.sol";

contract RaffleExtended is Raffle {
    uint256 public X;
    uint256 public Y;
    uint256 public Z;
    address public founder;
    address public staking;

    address public governor;

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

    function setGovernor(address _governor) public onlyOwner {
        governor = _governor;
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

    modifier onlyOwnerOrGovernor() {
        require(
            msg.sender == owner() || msg.sender == governor,
            "RaffleExtended: Caller is not the owner or governor"
        );
        _;
    }

    function setX(uint256 _X) public onlyOwnerOrGovernor {
        X = _X;
        emit XChanged(_X);
    }

    function setY(uint256 _Y) public onlyOwnerOrGovernor {
        Y = _Y;
        emit YChanged(_Y);
    }

    function setZ(uint256 _Z) public onlyOwnerOrGovernor {
        Z = _Z;
        emit ZChanged(_Z);
    }

    function setFounder(address _founder) public onlyOwner {
        founder = _founder;
    }

    function setStaking(address _staking) public onlyOwner {
        staking = _staking;
    }

    function setStatus(RaffleStatus _status) public onlyOwner {
        status = _status;
    }

    function _concludeWithdraw(Deposit storage depositNode) internal override {
        uint256 _pool = pool;

        raffleId++;
        depositState.lastDepositId = bytes32(0);
        pool = 0;
        status = RaffleStatus.FINISHED;

        TransferHelper.safeTransfer(
            whitelist[0],
            staking,
            (_pool * X) / 100000
        );
        TransferHelper.safeTransfer(
            whitelist[0],
            founder,
            (_pool * Y) / 100000
        );
        TransferHelper.safeTransfer(
            whitelist[0],
            depositNode.sender,
            (_pool * Z) / 100000
        );

        uint256 leftOver = 100000 - X - Y - Z;

        if (leftOver > 0) {
            TransferHelper.safeTransfer(
                whitelist[0],
                owner(),
                (pool * leftOver) / 100000
            );
        }

        emit RaffleFinished(raffleId - 1);
    }
}
