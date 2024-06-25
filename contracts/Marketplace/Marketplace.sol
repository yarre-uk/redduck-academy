// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { OrderType, OrderStatus, MarketplaceStorageState, Order, ProposalStorage } from "./MarketplaceStorage.sol";
import { MyERC721 } from "./ERC721.sol";
import { WETH } from "./WETH.sol";

contract Marketplace is Ownable, AccessControl, Initializable {
    MarketplaceStorageState internal _ordersState;
    using ProposalStorage for MarketplaceStorageState;

    MyERC721 internal _nftContract;
    WETH internal _wethContract;

    event OrderCreated(
        bytes32 indexed id,
        address indexed sender,
        OrderType indexed orderType
    );
    event OrderProcessed(
        bytes32 indexed id,
        address indexed executer,
        OrderStatus indexed state
    );

    constructor() Ownable(msg.sender) {}

    function initialize(
        MyERC721 _tokenNft,
        WETH _tokenWeth
    ) public virtual initializer onlyOwner {
        require(
            address(_tokenNft) != address(0),
            "Marketplace: Invalid NFT contract address"
        );
        require(
            address(_tokenWeth) != address(0),
            "Marketplace: Invalid WETH contract address"
        );

        _nftContract = _tokenNft;
        _wethContract = _tokenWeth;
    }

    function createOrder(
        uint256 _price,
        uint256 _nftId,
        OrderType _orderType
    ) external returns (bytes32) {
        require(_price > 0, "Marketplace: Invalid price");
        require(
            _nftContract.ownerOf(_nftId) == msg.sender,
            "Marketplace: Not the owner of the NFT"
        );

        Order memory order = Order({
            sender: msg.sender,
            price: _price,
            createdAt: block.number,
            nftId: _nftId,
            orderType: _orderType,
            status: OrderStatus.Created
        });

        _ordersState.addData(order);

        emit OrderCreated(_ordersState.lastOrderId, msg.sender, OrderType.Sell);

        return _ordersState.lastOrderId;
    }

    function processOrder(bytes32 _sellOrderId, bytes32 _buyOrderId) external {
        Order storage sellOrder = _ordersState.getData(_sellOrderId);
        Order storage buyOrder = _ordersState.getData(_buyOrderId);

        require(
            sellOrder.sender == msg.sender,
            "Marketplace: Not the owner of the sell order"
        );
        require(
            sellOrder.orderType == OrderType.Sell,
            "Marketplace: Invalid sell order type"
        );
        require(
            buyOrder.orderType == OrderType.Buy,
            "Marketplace: Invalid buy order type"
        );
        require(
            sellOrder.status == OrderStatus.Created,
            "Marketplace: Invalid sell order status"
        );
        require(
            buyOrder.status == OrderStatus.Created,
            "Marketplace: Invalid buy order status"
        );
        require(
            sellOrder.nftId == buyOrder.nftId,
            "Marketplace: Invalid NFT ID"
        );

        require(
            _wethContract.balanceOf(buyOrder.sender) >= buyOrder.price,
            "Marketplace: Insufficient WETH balance"
        );
        require(
            _wethContract.allowance(buyOrder.sender, address(this)) >=
                buyOrder.price,
            "Marketplace: Insufficient WETH allowance"
        );

        sellOrder.status = OrderStatus.Processed;
        buyOrder.status = OrderStatus.Processed;

        _nftContract.safeTransferFrom(
            sellOrder.sender,
            buyOrder.sender,
            sellOrder.nftId
        );

        _wethContract.transferFrom(
            buyOrder.sender,
            sellOrder.sender,
            buyOrder.price
        );

        emit OrderProcessed(_sellOrderId, msg.sender, OrderStatus.Processed);
        emit OrderProcessed(_buyOrderId, msg.sender, OrderStatus.Processed);
    }

    function cancelOrder(bytes32 _orderId) external {
        Order storage order = _ordersState.getData(_orderId);

        require(
            order.sender == msg.sender,
            "Marketplace: Not the owner of the order"
        );
        require(
            order.status == OrderStatus.Created,
            "Marketplace: Invalid order status"
        );

        order.status = OrderStatus.Canceled;

        emit OrderProcessed(_orderId, msg.sender, OrderStatus.Canceled);
    }

    function getOrder(
        bytes32 _orderId
    ) external view returns (Order memory order) {
        return _ordersState.getData(_orderId);
    }
}
