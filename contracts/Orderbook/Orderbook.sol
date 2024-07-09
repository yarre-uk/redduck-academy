// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { MyERC1155 } from "./MyERC1155.sol";
import { OrderbookLists, ListData } from "./OrderbookStorage.sol";
import { LinkedListState, LinkedListLibrary, OrderData } from "./LinkedList.sol";

import "hardhat/console.sol";

contract Orderbook is Ownable, AccessControl, Initializable {
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

    constructor() Ownable(msg.sender) {}

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
        console.log("Orderbook: validateOrder start");
        require(
            allowedTokensForTrade[_tokenId],
            "Orderbook: Token not allowed for trade"
        );
        require(_price > 0, "Orderbook: Price should be greater than 0");
        require(_amount > 0, "Orderbook: Amount should be greater than 0");
        console.log("Orderbook: validateOrder end");
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
        console.log("Orderbook: createPassiveOrder start");
        bool isBuy = _orderType == OrderType.BUY;
        require(
            isBuy || _price * _amount == msg.value,
            "Orderbook: Price should be equal to msg.value if you are buying"
        );
        require(
            !isBuy || ercContract.balanceOf(msg.sender, _tokenId) >= _amount,
            "Orderbook: Insufficient balance"
        );
        require(
            !isBuy || ercContract.isApprovedForAll(msg.sender, address(this)),
            "Orderbook: Not approved"
        );
        console.log("Orderbook: createPassiveOrder require passed");

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
            balances[msg.sender] += _price;
        }

        console.log("Orderbook: createPassiveOrder before insert");

        bytes32 id = list.insert(_insertPosition, order);

        //! some random error
        /*CompilerError: Stack too deep. Try compiling with `--via-ir` (cli) or the equivalent `viaIR: true` (standard JSON) while enabling the optimizer. Otherwise, try removing local variables.
           --> contracts/Orderbook/Orderbook.sol:167:13:
            |
        167 |             _price,
            |             ^^^^^^


        Error HH600: Compilation failed*/

        emit OrderCreated(
            id,
            msg.sender,
            _tokenId,
            _price,
            _amount,
            block.timestamp,
            _orderType
        );

        console.log("Orderbook: createPassiveOrder end");

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

        require(
            currentOrder.owner == msg.sender,
            "Orderbook: Not owner of order"
        );

        if (_orderType == OrderType.BUY) {
            _processBuyOrder(_tokenId, currentOrder);
        } else {
            _processSellOrder(_tokenId, currentOrder);
        }
    }

    function _processBuyOrder(
        uint256 _tokenId,
        OrderData storage buyOrder
    ) internal {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage currentList = lists.sellLinkedList;

        OrderData storage bestSellOrder = currentList.getTail();

        if (bestSellOrder.price <= buyOrder.price) {
            uint256 amountToBuy = buyOrder.amount;
            uint256 amountToSell = bestSellOrder.amount;

            uint256 payment = buyOrder.price * amountToBuy;
            bool transferred = false;

            if (amountToBuy == amountToSell) {
                currentList.deleteNode(currentList.getTailId());

                balances[msg.sender] -= payment;
                balances[bestSellOrder.owner] += payment;
            } else if (amountToBuy < amountToSell) {
                bestSellOrder.amount -= amountToBuy;

                balances[msg.sender] -= payment;
                balances[bestSellOrder.owner] += payment;
            } else {
                currentList.deleteNode(currentList.getTailId());
                buyOrder.amount -= amountToSell;

                balances[msg.sender] -= payment;
                balances[bestSellOrder.owner] += payment;

                transferred = true;

                ercContract.safeTransferFrom(
                    bestSellOrder.owner,
                    address(this),
                    _tokenId,
                    amountToBuy,
                    ""
                );

                ercContract.safeTransferFrom(
                    address(this),
                    msg.sender,
                    _tokenId,
                    amountToBuy,
                    ""
                );

                _processBuyOrder(_tokenId, buyOrder);
            }

            if (!transferred) {
                ercContract.safeTransferFrom(
                    bestSellOrder.owner,
                    address(this),
                    _tokenId,
                    amountToSell,
                    ""
                );

                ercContract.safeTransferFrom(
                    address(this),
                    msg.sender,
                    _tokenId,
                    amountToSell,
                    ""
                );
            }
        }
    }

    function _processSellOrder(
        uint256 _tokenId,
        OrderData storage sellOrder
    ) internal {
        ListData storage lists = _orderbookLists.lists[_tokenId];

        LinkedListState storage currentList = lists.buyLinkedList;

        OrderData storage bestBuyOrder = currentList.getTail();

        if (bestBuyOrder.price >= sellOrder.price) {
            uint256 amountToSell = sellOrder.amount;
            uint256 amountToBuy = bestBuyOrder.amount;

            uint256 payment = bestBuyOrder.price * amountToBuy;
            bool transferred = false;

            if (amountToBuy == amountToSell) {
                currentList.deleteNode(currentList.getTailId());

                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;
            } else if (amountToBuy < amountToSell) {
                sellOrder.amount -= amountToBuy;

                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;
            } else {
                currentList.deleteNode(currentList.getTailId());
                bestBuyOrder.amount -= amountToSell;

                balances[msg.sender] += payment;
                balances[bestBuyOrder.owner] -= payment;

                transferred = true;

                ercContract.safeTransferFrom(
                    msg.sender,
                    address(this),
                    _tokenId,
                    amountToBuy,
                    ""
                );

                ercContract.safeTransferFrom(
                    address(this),
                    bestBuyOrder.owner,
                    _tokenId,
                    amountToBuy,
                    ""
                );

                _processSellOrder(_tokenId, sellOrder);
            }

            if (!transferred) {
                ercContract.safeTransferFrom(
                    msg.sender,
                    address(this),
                    _tokenId,
                    amountToSell,
                    ""
                );

                ercContract.safeTransferFrom(
                    address(this),
                    bestBuyOrder.owner,
                    _tokenId,
                    amountToSell,
                    ""
                );
            }
        }
    }
}
