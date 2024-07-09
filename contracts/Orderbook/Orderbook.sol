// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import { MyERC1155 } from "./MyERC1155.sol";
import { OrderbookLists, ListData } from "./OrderbookStorage.sol";
import { LinkedListState, LinkedListLibrary, OrderData } from "./LinkedList.sol";

contract Orderbook is Ownable, AccessControl, Initializable, ERC1155Holder {
    OrderbookLists internal _orderbookLists;

    MyERC1155 public ercContract;
    mapping(uint256 => bool) public allowedTokensForTrade;
    mapping(address => uint256) public balances;

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
    event OrderUpdated(bytes32 indexed id, uint256 amount);
    event OrderProcessed(bytes32 indexed id);
    event OrderDeleted(bytes32 indexed id);

    constructor() Ownable(msg.sender) {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Holder, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function initialize(
        MyERC1155 _erc1155,
        uint256[] memory _tokens
    ) public virtual initializer onlyOwner {
        require(
            address(_erc1155) != address(0),
            "Orderbook: Invalid ERC1155 contract address"
        );

        ercContract = _erc1155;

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
            allowedTokensForTrade[_tokenId],
            "Orderbook: Token not allowed for trade"
        );
        require(_price > 0, "Orderbook: Price should be greater than 0");
        require(_amount > 0, "Orderbook: Amount should be greater than 0");
        _;
    }

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

    function createPassiveOrder(
        uint256 _tokenId,
        uint256 _price,
        uint256 _amount,
        OrderType _orderType,
        bytes32 _insertPosition
    )
        external
        payable
        validateOrder(_tokenId, _price, _amount)
        returns (bytes32)
    {
        bool isBuy = _orderType == OrderType.BUY;
        require(
            !isBuy || _price * _amount == msg.value,
            "Orderbook: Price should be equal to msg.value if you are buying"
        );
        require(
            isBuy || ercContract.balanceOf(msg.sender, _tokenId) >= _amount,
            "Orderbook: Insufficient balance"
        );
        require(
            isBuy || ercContract.isApprovedForAll(msg.sender, address(this)),
            "Orderbook: Not approved"
        );

        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage list = isBuy
            ? lists.buyLinkedList
            : lists.sellLinkedList;

        OrderData memory order = OrderData({
            price: _price,
            amount: _amount,
            owner: msg.sender,
            createdAt: block.timestamp
        });

        if (isBuy) {
            balances[msg.sender] += msg.value;
        }

        bytes32 id = list.insert(_insertPosition, order);

        emit OrderCreated(
            id,
            msg.sender,
            _tokenId,
            _price,
            _amount,
            block.timestamp,
            _orderType
        );

        matchOrder(id, _tokenId, _orderType);

        return id;
    }

    function matchOrder(
        bytes32 _orderId,
        uint256 _tokenId,
        OrderType _orderType
    ) public {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage currentList = _orderType == OrderType.BUY
            ? lists.buyLinkedList
            : lists.sellLinkedList;

        OrderData storage currentOrder = currentList.getById(_orderId);

        if (currentList.head == bytes32(0)) {
            return;
        }

        require(
            currentOrder.owner == msg.sender,
            "Orderbook: Not owner of order"
        );

        if (_orderType == OrderType.BUY) {
            _processBuyOrder(_tokenId, _orderId, currentOrder);
        } else {
            _processSellOrder(_tokenId, _orderId, currentOrder);
        }
    }

    function _processBuyOrder(
        uint256 _tokenId,
        bytes32 _buyOrderId,
        OrderData storage _buyOrder
    ) internal {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage sellList = lists.sellLinkedList;
        LinkedListState storage buyList = lists.buyLinkedList;

        OrderData memory bestSellOrder = (sellList.objects[sellList.tail]).data;

        if (
            sellList.tail != bytes32(0) &&
            bestSellOrder.price <= _buyOrder.price
        ) {
            uint256 amountToBuy = _buyOrder.amount;
            uint256 amountToSell = bestSellOrder.amount;

            uint256 payment = _buyOrder.price * amountToBuy;

            if (amountToBuy == amountToSell) {
                sellList.deleteNode(sellList.tail);
                buyList.deleteNode(_buyOrderId);

                balances[msg.sender] -= payment;
                balances[bestSellOrder.owner] += payment;

                emit OrderProcessed(_buyOrderId);
                emit OrderProcessed(sellList.tail);
            } else if (amountToBuy < amountToSell) {
                buyList.deleteNode(_buyOrderId);

                bestSellOrder.amount -= amountToBuy;
                balances[msg.sender] -= payment;
                balances[bestSellOrder.owner] += payment;

                sellList.objects[sellList.tail].data = bestSellOrder;

                emit OrderProcessed(_buyOrderId);
                emit OrderUpdated(sellList.tail, bestSellOrder.amount);
            } else {
                sellList.deleteNode(sellList.tail);
                _buyOrder.amount -= amountToSell;

                balances[msg.sender] -= _buyOrder.price * amountToSell;
                balances[bestSellOrder.owner] += _buyOrder.price * amountToSell;

                buyList.objects[_buyOrderId].data = _buyOrder;

                emit OrderProcessed(sellList.tail);
                emit OrderUpdated(_buyOrderId, _buyOrder.amount);
            }
            ercContract.safeTransferFrom(
                bestSellOrder.owner,
                address(this),
                _tokenId,
                amountToSell,
                "0x"
            );

            ercContract.safeTransferFrom(
                address(this),
                msg.sender,
                _tokenId,
                amountToSell,
                "0x"
            );
        }
    }

    function _processSellOrder(
        uint256 _tokenId,
        bytes32 _sellOrderId,
        OrderData storage _sellOrder
    ) internal {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage sellList = lists.sellLinkedList;
        LinkedListState storage buyList = lists.buyLinkedList;

        OrderData memory bestBuyOrder = (buyList.objects[buyList.tail]).data;

        if (
            buyList.tail != bytes32(0) && bestBuyOrder.price >= _sellOrder.price
        ) {
            uint256 amountToBuy = bestBuyOrder.amount;
            uint256 amountToSell = _sellOrder.amount;

            uint256 payment = bestBuyOrder.price * amountToBuy;

            if (amountToBuy == amountToSell) {
                buyList.deleteNode(buyList.tail);
                sellList.deleteNode(_sellOrderId);

                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;

                emit OrderProcessed(_sellOrderId);
                emit OrderProcessed(buyList.tail);
            } else if (amountToBuy < amountToSell) {
                buyList.deleteNode(buyList.tail);

                _sellOrder.amount -= amountToBuy;
                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;

                sellList.objects[_sellOrderId].data = _sellOrder;

                emit OrderProcessed(_sellOrderId);
                emit OrderUpdated(_sellOrderId, _sellOrder.amount);
            } else {
                sellList.deleteNode(_sellOrderId);
                bestBuyOrder.amount -= amountToSell;

                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;

                buyList.objects[buyList.tail].data = bestBuyOrder;

                emit OrderProcessed(buyList.tail);
                emit OrderUpdated(_sellOrderId, _sellOrder.amount);
            }
            ercContract.safeTransferFrom(
                msg.sender,
                address(this),
                _tokenId,
                amountToBuy,
                "0x"
            );

            ercContract.safeTransferFrom(
                address(this),
                bestBuyOrder.owner,
                _tokenId,
                amountToBuy,
                "0x"
            );
        }
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
