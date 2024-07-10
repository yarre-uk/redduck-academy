// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Orderbook } from "./Orderbook.sol";
import { ListData } from "./OrderbookStorage.sol";
import { LinkedListState, LinkedListLibrary, OrderData } from "./LinkedList.sol";

contract OrderbookExtended is Orderbook {
    using LinkedListLibrary for LinkedListState;

    function getOrder(
        uint256 _tokenId,
        OrderType _orderType,
        bytes32 _id
    ) external view returns (OrderData memory) {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage list = _orderType == OrderType.BUY
            ? lists.buyLinkedList
            : lists.sellLinkedList;

        return list.getById(_id);
    }

    function manageTokensForTrade(
        uint256[] memory forRemoval,
        uint256[] memory forAddition
    ) external onlyOwner {
        if (forRemoval.length > 0) {
            for (uint256 i = 0; i < forRemoval.length; i++) {
                allowedTokensForTrade[forRemoval[i]] = false;
            }
        }

        if (forAddition.length > 0) {
            for (uint256 i = 0; i < forAddition.length; i++) {
                allowedTokensForTrade[forAddition[i]] = true;
            }
        }
    }

    function deposit() external payable {
        require(msg.value > 0, "Orderbook: Amount should be greater than 0");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) external {
        require(
            balances[msg.sender] >= _amount,
            "Orderbook: Insufficient balance"
        );
        balances[msg.sender] -= _amount;
        (bool success, ) = payable(msg.sender).call{ value: _amount }("");
        require(success, "Orderbook: Transfer failed");
    }

    function traverseList(
        uint256 _tokenId,
        OrderType _orderType
    ) external view {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage list = _orderType == OrderType.BUY
            ? lists.buyLinkedList
            : lists.sellLinkedList;

        list.traverse();
    }
}
