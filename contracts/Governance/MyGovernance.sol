// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { GovernanceToken } from "./GovernanceToken.sol";
import { RaffleExtended } from "../Raffle/RaffleExtended.sol";
import { ProposalStorage, Proposal, ProposalStorageState, ProposalState } from "./ProposalStorage.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "hardhat/console.sol";

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
        address _raffle,
        uint256 _percentageForProposal,
        uint256 _blocksBeforeVoting,
        uint256 _blocksBeforeExecution
    ) public initializer onlyOwner {
        token = GovernanceToken(_token);
        raffle = RaffleExtended(_raffle);

        percentageForProposal = _percentageForProposal;
        blocksBeforeVoting = _blocksBeforeVoting;
        blocksBeforeExecution = _blocksBeforeExecution;
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
        bytes[] memory _calldatas,
        string memory _description
    ) public hasEnoughPercentage(percentageForProposal) returns (bytes32 id) {
        Proposal memory proposal = Proposal({
            sender: msg.sender,
            calldatas: _calldatas,
            proposedAt: block.number,
            description: _description,
            votingStartedAt: 0,
            forVotes: 0,
            againstVotes: 0,
            state: ProposalState.Created
        });

        id = _proposalsState.addData(proposal);

        emit ProposalCreated(id, msg.sender);
    }

    function voteForProposal(bytes32 id, bool voteInFavor) public {
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

        uint256 weight = token.getPastVotes(
            msg.sender,
            proposal.proposedAt + blocksBeforeVoting
        );

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

        for (uint256 i = 0; i < proposal.calldatas.length; i++) {
            (bool success, ) = address(raffle).call(proposal.calldatas[i]);

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

    function getProposal(
        bytes32 id
    ) public view returns (Proposal memory proposal) {
        return _proposalsState.getData(id);
    }

    function test(string memory asd) public pure {
        console.logString(asd);
    }
}
