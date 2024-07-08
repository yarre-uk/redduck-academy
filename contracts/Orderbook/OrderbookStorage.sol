//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { LinkedListState } from "./LinkedList.sol";

struct OrderbookLists {
    mapping(uint256 => ListData) lists;
}

struct ListData {
    LinkedListState sellLinkedList;
    LinkedListState buyLinkedList;
}

// library OrderbookStorage {}
