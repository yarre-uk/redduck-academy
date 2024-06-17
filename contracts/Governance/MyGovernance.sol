// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "../ERC20/YarreToken.sol";
import { RaffleExtended } from "../Raffle/RaffleExtended.sol";
import { ProposalStorage, Proposal, State } from "./ProposalStorage.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract MyGovernance is Ownable, AccessControl, Initializable {
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    YarreToken public token;
    RaffleExtended public raffle;

    uint256 public percentageForProposal;

    uint256 public blockBeforeVoting;
    uint256 public blockBeforeExecution;

    State private state;

    using ProposalStorage for State;

    event ProposalCreated(bytes32 id, uint256 percentage);
    event ProposalVoted(bytes32 id, address voter);
    event ProposalExecuted(bytes32 id);

    error UnauthorizedExecuter(address caller);

    constructor() Ownable(msg.sender) {}

    function initialize(
        address payable _token,
        address _raffle
    ) public initializer onlyOwner {
        token = YarreToken(_token);
        raffle = RaffleExtended(_raffle);

        percentageForProposal = 100;
        blockBeforeVoting = 300;
        blockBeforeExecution = 300;
    }

    modifier hasEnoughPercentage(uint256 _percentageCap) {
        require(
            token.userPercentage() >= _percentageCap,
            "MyGovernance: not enough percentage"
        );
        _;
    }

    function grantRoleExecuter(address account) public onlyOwner {
        grantRole(EXECUTER_ROLE, account);
    }
}
