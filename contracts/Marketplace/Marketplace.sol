// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { OrderType, OrderStatus, MarketplaceStorageState, Order, ProposalStorage } from "./MarketplaceStorage.sol";

contract Marketplace is Ownable, AccessControl, Initializable {
    MarketplaceStorageState internal _ordersState;
    using ProposalStorage for MarketplaceStorageState;

    constructor() Ownable(msg.sender) {}

    function initialize() public virtual initializer onlyOwner {}
}
