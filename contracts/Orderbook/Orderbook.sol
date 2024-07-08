// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { WETH } from "../utils/WETH.sol";
import { MyERC1155 } from "./MyERC1155.sol";
import { OrderbookLists, ListData } from "./OrderbookStorage.sol";
import { LinkedListState, LinkedListLibrary, OrderData } from "./LinkedList.sol";

contract Orderbook is Ownable, AccessControl, Initializable {
    OrderbookLists internal _orderbookLists;

    MyERC1155 public ercContract;
    WETH public wethContract;
    mapping(uint256 => bool) public allowedTokensForTrade;

    using LinkedListLibrary for LinkedListState;

    enum OrderType {
        BUY,
        SELL
    }

    event OrderCreated(
        bytes32 indexed id,
        address indexed sender,
        uint256 indexed tokenId,
        uint256 price,
        uint256 amount,
        uint256 createdAt,
        OrderType orderType
    );

    constructor() Ownable(msg.sender) {}

    function initialize(
        MyERC1155 _erc1155,
        WETH _weth,
        uint256[] memory _tokens
    ) public virtual initializer onlyOwner {
        require(
            address(_erc1155) != address(0),
            "Orderbook: Invalid ERC1155 contract address"
        );
        require(
            address(_weth) != address(0),
            "Orderbook: Invalid WETH contract address"
        );

        ercContract = _erc1155;
        wethContract = _weth;

        for (uint256 i = 0; i < _tokens.length; i++) {
            allowedTokensForTrade[_tokens[i]] = true;
        }
    }

    modifier validateOrder(
        uint256 _tokenId,
        uint256 _price,
        uint256 _amount
    ) {
        require(
            ercContract.balanceOf(msg.sender, _tokenId) >= _amount,
            "Orderbook: Insufficient balance"
        );
        require(
            ercContract.isApprovedForAll(msg.sender, address(this)),
            "Orderbook: Not approved"
        );
        require(_price > 0, "Orderbook: Price should be greater than 0");
        require(_amount > 0, "Orderbook: Amount should be greater than 0");
        _;
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

    function createPassiveOrder(
        uint256 _tokenId,
        uint256 _price,
        uint256 _amount,
        OrderType _orderType,
        bytes32 _insertPosition
    ) external validateOrder(_tokenId, _price, _amount) returns (bytes32 id) {
        require(
            ercContract.balanceOf(msg.sender, _tokenId) >= _amount,
            "Orderbook: Insufficient balance"
        );
        require(
            ercContract.isApprovedForAll(msg.sender, address(this)),
            "Orderbook: Not approved"
        );
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage list = _orderType == OrderType.BUY
            ? lists.buyLinkedList
            : lists.sellLinkedList;

        OrderData memory order = OrderData({
            price: _price,
            amount: _amount,
            owner: msg.sender,
            createdAt: block.timestamp
        });

        id = list.insert(_insertPosition, order);

        emit OrderCreated(
            id,
            msg.sender,
            _tokenId,
            _price,
            _amount,
            block.timestamp,
            _orderType
        );
    }
}
