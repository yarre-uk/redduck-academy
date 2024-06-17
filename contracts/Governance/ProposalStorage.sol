// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

struct State {
    mapping(bytes32 => Proposal) proposals;
    bytes32 lastProposalId;
}

struct Proposal {
    uint256 id;
    address sender;
    uint256 proposedAt;
    uint256 votingStartedAt;
    bool executed;
}

library ProposalStorage {
    function getId(Proposal memory _params) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _params.id,
                    _params.sender,
                    _params.proposedAt,
                    _params.votingStartedAt,
                    _params.executed
                )
            );
    }

    function isEmpty(
        State storage state,
        bytes32 id
    ) internal view returns (bool) {
        return state.proposals[id].sender == address(0);
    }

    function addData(
        State storage state,
        Proposal memory _Proposal
    ) internal returns (bytes32) {
        bytes32 id = getId(_Proposal);
        state.proposals[id] = _Proposal;
        state.lastProposalId = id;

        return id;
    }

    function getData(
        State storage state,
        bytes32 id
    ) internal view returns (Proposal memory) {
        return state.proposals[id];
    }

    function updateData(
        State storage state,
        bytes32 id,
        Proposal memory _Proposal
    ) internal {
        state.proposals[id] = _Proposal;
    }

    function removeData(State storage state, bytes32 id) internal {
        delete state.proposals[id];
    }
}
