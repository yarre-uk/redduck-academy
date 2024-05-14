// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { YarreToken } from "./ERC20/YarreToken.sol";

contract Raffle {
    uint256 internal pool = 0;
    mapping(address => uint) internal deposits;
    address[] internal whitelist;

    constructor(address[] memory approvedTokens) {
        whitelist = approvedTokens;
    }
}
