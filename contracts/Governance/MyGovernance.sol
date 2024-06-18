// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { GovernanceToken } from "./GovernanceToken.sol";
import { RaffleExtended } from "../Raffle/RaffleExtended.sol";
import { ProposalStorage, Proposal, ProposalStorageState, ProposalState } from "./ProposalStorage.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract MyGovernance is Ownable, AccessControl, Initializable {
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    GovernanceToken public token;
    RaffleExtended public raffle;

    uint256 public percentageForProposal;

    uint256 public blocksBeforeVoting;
    uint256 public blocksBeforeExecution;

    ProposalStorageState private _proposalsState;
    mapping(bytes32 => mapping(address => bool)) private _votes;

    using ProposalStorage for ProposalStorageState;

    event ProposalCreated(bytes32 indexed id, address indexed sender);
    event ProposalVoted(bytes32 indexed id, address indexed voter);
    event ProposalProcessed(
        bytes32 indexed id,
        address indexed executer,
        ProposalState indexed state
    );

    error UnauthorizedExecuter(address caller);

    constructor() Ownable(msg.sender) {}

    function initialize(
        address payable _token,
        address _raffle
    ) public initializer onlyOwner {
        token = GovernanceToken(_token);
        raffle = RaffleExtended(_raffle);

        percentageForProposal = 100;
        blocksBeforeVoting = 300;
        blocksBeforeExecution = 300;
    }

    modifier hasEnoughPercentage(uint256 _percentageCap) {
        require(
            token.balanceOf(msg.sender) >=
                (token.totalSupply() * _percentageCap) / 10000,
            "MyGovernance: Sender does not have enough percentage"
        );
        _;
    }

    function grantRoleExecuter(address account) public onlyOwner {
        grantRole(EXECUTER_ROLE, account);
    }

    function revokeRoleExecuter(address account) public onlyOwner {
        revokeRole(EXECUTER_ROLE, account);
    }

    function createProposal(
        bytes32[] memory _actions,
        bytes32 _description
    ) public hasEnoughPercentage(percentageForProposal) {
        Proposal memory proposal = Proposal({
            sender: msg.sender,
            signatures: _actions,
            calldatas: _actions,
            proposedAt: block.number,
            description: _description,
            votingStartedAt: 0,
            forVotes: 0,
            againstVotes: 0,
            state: ProposalState.Created
        });

        bytes32 id = _proposalsState.addData(proposal);

        emit ProposalCreated(id, msg.sender);
    }

    /**
     * @dev Allows a voter to vote on a proposal.
     * @param id The ID of the proposal.
     * @param voteInFavor The decision of the voter (true for voting in favor, false for voting against).
     * @notice This function requires the proposal to be in the voting period and the voter to have non-zero weight.
     * @notice The voter cannot be the proposer and cannot have already voted on the proposal.
     * @notice The weight of the voter is determined by the number of tokens they hold at the time of the proposal.
     */
    function voteProposal(bytes32 id, bool voteInFavor) public {
        Proposal storage proposal = _proposalsState.getData(id);

        require(
            proposal.sender != msg.sender,
            "MyGovernance: Sender is the proposer"
        );
        require(
            _votes[id][msg.sender] == false,
            "MyGovernance: Sender has already voted"
        );
        require(
            proposal.votingStartedAt + block.number > blocksBeforeVoting,
            "MyGovernance: Voting period has not started"
        );

        uint256 weight = token.getPastVotes(msg.sender, proposal.proposedAt);

        require(weight > 0, "MyGovernance: Voter does not have any weight");

        if (proposal.votingStartedAt == 0) {
            proposal.votingStartedAt = block.number;
        }

        if (voteInFavor) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit ProposalVoted(id, msg.sender);
    }

    function _cancelProposal(bytes32 id, Proposal storage proposal) internal {
        proposal.state = ProposalState.Canceled;

        emit ProposalProcessed(id, msg.sender, ProposalState.Canceled);
    }

    function _executeProposal(bytes32 id, Proposal storage proposal) internal {
        proposal.state = ProposalState.Executed;

        for (uint256 i = 0; i < proposal.signatures.length; i++) {
            (bool success, ) = address(raffle).call(
                abi.encodePacked(proposal.signatures[i], proposal.calldatas[i])
            );

            require(success, "MyGovernance: Proposal execution failed");
        }

        emit ProposalProcessed(id, msg.sender, ProposalState.Executed);
    }

    function processProposal(bytes32 id) public onlyRole(EXECUTER_ROLE) {
        Proposal storage proposal = _proposalsState.getData(id);

        require(
            proposal.votingStartedAt + block.number > blocksBeforeExecution,
            "MyGovernance: Execution period has not started"
        );
        require(
            proposal.forVotes > proposal.againstVotes,
            "MyGovernance: Proposal has not passed"
        );
        require(
            proposal.state != ProposalState.Executed ||
                proposal.state != ProposalState.Canceled,
            "MyGovernance: Proposal has been processed"
        );

        if (proposal.forVotes <= proposal.againstVotes) {
            _cancelProposal(id, proposal);
        } else {
            _executeProposal(id, proposal);
        }
    }
}
