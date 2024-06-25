// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Governance } from "./Governance.sol";
import { GovernanceToken } from "./GovernanceToken.sol";
import { RaffleExtended } from "../Raffle/RaffleExtended.sol";
import { Proposal, ProposalStorage, ProposalStorageState } from "./ProposalStorage.sol";

contract GovernanceExtended is Governance {
    using ProposalStorage for ProposalStorageState;

    function grantRoleExecuter(address account) public onlyOwner {
        grantRole(EXECUTER_ROLE, account);
    }

    function revokeRoleExecuter(address account) public onlyOwner {
        revokeRole(EXECUTER_ROLE, account);
    }

    function setTokenAddress(GovernanceToken _token) public onlyOwner {
        token = _token;
    }

    function setRaffleAddress(RaffleExtended _raffle) public onlyOwner {
        raffle = _raffle;
    }

    function setPercentageForProposal(
        uint256 _percentageForProposal
    ) public onlyOwner {
        percentageForProposal = _percentageForProposal;
    }

    function setBlocksBeforeVoting(
        uint256 _blocksBeforeVoting
    ) public onlyOwner {
        blocksBeforeVoting = _blocksBeforeVoting;
    }

    function setBlocksBeforeExecution(
        uint256 _blocksBeforeExecution
    ) public onlyOwner {
        blocksBeforeExecution = _blocksBeforeExecution;
    }

    function getProposal(
        bytes32 _id
    ) public view returns (Proposal memory proposal) {
        return _proposalsState.getData(_id);
    }

    function getProposals(
        bytes32[] memory _ids
    ) public view returns (Proposal[] memory) {
        Proposal[] memory proposals = new Proposal[](_ids.length);

        for (uint256 i = 0; i < _ids.length; i++) {
            proposals[i] = _proposalsState.getData(_ids[i]);
        }

        return proposals;
    }
}
