// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

struct State {
    mapping(bytes32 => Deposit) deposits;
    bytes32 lastDepositId;
}

struct Deposit {
    uint256 raffleId;
    address sender;
    uint256 amount;
    uint256 point;
    bytes32 prevDeposit;
}

library DepositStorage {
    function getId(Deposit memory _params) internal pure returns (bytes32) {
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

    function isEmpty(
        State storage state,
        bytes32 id
    ) internal view returns (bool) {
        return state.deposits[id].sender == address(0);
    }

    function addNode(
        State storage state,
        Deposit memory _deposit
    ) internal returns (bytes32) {
        bytes32 id = getId(_deposit);
        state.deposits[id] = _deposit;
        state.lastDepositId = id;

        return id;
    }
}
