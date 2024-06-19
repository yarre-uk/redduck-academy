// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

enum ProposalState {
    Created,
    Executed,
    Canceled
}

struct ProposalStorageState {
    mapping(bytes32 => Proposal) proposals;
    bytes32 lastProposalId;
}

// Timestamps are in block numbers
struct Proposal {
    address sender;
    bytes[] calldatas;
    uint256 proposedAt;
    string description;
    //---
    uint256 votingStartedAt;
    uint256 forVotes;
    uint256 againstVotes;
    ProposalState state;
}

library ProposalStorage {
    function getId(Proposal memory _params) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _params.sender,
                    _params.calldatas,
                    _params.proposedAt,
                    _params.description
                )
            );
    }

    function isEmpty(
        ProposalStorageState storage state,
        bytes32 id
    ) internal view returns (bool) {
        return state.proposals[id].sender == address(0);
    }

    function addData(
        ProposalStorageState storage state,
        Proposal memory proposal
    ) internal returns (bytes32 id) {
        id = getId(proposal);
        state.proposals[id] = proposal;
        state.lastProposalId = id;
    }

    function getData(
        ProposalStorageState storage state,
        bytes32 id
    ) internal view returns (Proposal storage) {
        return state.proposals[id];
    }
}
