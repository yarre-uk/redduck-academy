// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "./Ownable.sol";

contract DepositStorage is Ownable {
    //TODO make internal
    uint256 public pool = 0;
    mapping(bytes32 => Deposit) internal deposits;
    uint24 internal poolFee = 3000;
    bytes32 public lastDepositId = bytes32(0);

    struct Deposit {
        uint256 raffleId;
        address sender;
        uint256 amount;
        uint256 point;
        bytes32 prevDeposit;
    }

    event Deposited(
        address indexed sender,
        bytes32 indexed id,
        Deposit deposit
    );

    function getId(Deposit memory _params) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _params.raffleId,
                    _params.sender,
                    _params.amount,
                    _params.point,
                    _params.prevDeposit
                )
            );
    }

    function isEmpty(bytes32 id) public view returns (bool) {
        return deposits[id].sender == address(0);
    }

    function addNode(Deposit memory _deposit) public returns (bytes32) {
        bytes32 id = getId(_deposit);
        deposits[id] = _deposit;
        return id;
    }

    function setPoolFee(uint24 _poolFee) public onlyOwner {
        poolFee = _poolFee;
    }
}
