// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { OrderType, OrderStatus, Order } from "./MarketplaceStorage.sol";
import { MyERC721 } from "./MyERC721.sol";
import { WETH } from "./WETH.sol";

contract MarketplaceOff is Ownable, AccessControl, Initializable {
    //! DON'T USE, this prop is required for the contract
    //! to work properly as the implementation for the proxy
    bytes internal _ordersState;

    MyERC721 internal _nftContract;
    WETH internal _wethContract;

    mapping(uint256 => mapping(address => bool)) public ordered;
    mapping(bytes32 => bytes) public orders;

    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    event OrderCreated(
        bytes32 indexed id,
        address indexed sender,
        OrderType indexed orderType,
        uint256 price,
        uint256 nftId,
        uint256 createdAt
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

    function _verifyOrder(
        Order memory _order,
        address _sender,
        bytes memory _signature
    ) internal view returns (bytes memory) {
        bytes32 message = keccak256(
            abi.encodePacked(
                _order.createdAt,
                _order.nftId,
                _order.orderType,
                _order.price,
                _order.sender,
                _order.status,
                block.number,
                block.chainid,
                address(this)
            )
        );

        require(
            message.toEthSignedMessageHash().recover(_signature) == _sender,
            "Invalid signature"
        );

        return _signature;
    }

    function _getId(Order memory _params) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _params.sender,
                    _params.price,
                    _params.createdAt,
                    _params.nftId,
                    _params.orderType
                )
            );
    }

    function createOrder(
        uint256 _price,
        uint256 _nftId,
        OrderType _orderType,
        bytes memory _signature
    ) external returns (bytes32) {
        require(_price > 0, "Marketplace: Invalid price");
        require(
            _nftContract.ownerOf(_nftId) == msg.sender ||
                _orderType == OrderType.Buy,
            "Marketplace: Not the owner of the NFT"
        );
        require(
            ordered[_nftId][msg.sender] != true,
            "Marketplace: NFT already ordered this way"
        );

        Order memory order = Order({
            sender: msg.sender,
            price: _price,
            createdAt: block.number,
            nftId: _nftId,
            orderType: _orderType,
            status: OrderStatus.Created
        });

        bytes32 id = _getId(order);
        orders[id] = _signature;

        emit OrderCreated(
            id,
            msg.sender,
            _orderType,
            _price,
            _nftId,
            block.number
        );

        return id;
    }

    function processOrder(
        Order memory _sellOrder,
        Order memory _buyOrder,
        bytes memory _signature,
        bytes32 _orderHash1,
        bytes32 _orderHash2
    ) external {
        _verifyOrder(_sellOrder, msg.sender, _signature);
        _verifyOrder(_sellOrder, msg.sender, orders[_orderHash1]);
        _verifyOrder(_buyOrder, msg.sender, orders[_orderHash2]);

        require(
            _sellOrder.sender == msg.sender,
            "Marketplace: Not the owner of the sell order"
        );
        require(
            _sellOrder.orderType == OrderType.Sell,
            "Marketplace: Invalid sell order type"
        );
        require(
            _buyOrder.orderType == OrderType.Buy,
            "Marketplace: Invalid buy order type"
        );
        require(
            _sellOrder.status == OrderStatus.Created,
            "Marketplace: Invalid sell order status"
        );
        require(
            _buyOrder.status == OrderStatus.Created,
            "Marketplace: Invalid buy order status"
        );
        require(
            _sellOrder.nftId == _buyOrder.nftId,
            "Marketplace: Invalid NFT ID"
        );

        require(
            _wethContract.balanceOf(_buyOrder.sender) >= _buyOrder.price,
            "Marketplace: Insufficient WETH balance"
        );
        require(
            _wethContract.allowance(_buyOrder.sender, address(this)) >=
                _buyOrder.price,
            "Marketplace: Insufficient WETH allowance"
        );
        require(
            _nftContract.ownerOf(_sellOrder.nftId) == _sellOrder.sender,
            "Marketplace: Not the owner of the NFT"
        );

        _nftContract.safeTransferFrom(
            _sellOrder.sender,
            _buyOrder.sender,
            _sellOrder.nftId
        );

        _wethContract.transferFrom(
            _buyOrder.sender,
            _sellOrder.sender,
            _buyOrder.price
        );

        emit OrderProcessed(
            _getId(_sellOrder),
            msg.sender,
            OrderStatus.Processed
        );
        emit OrderProcessed(
            _getId(_buyOrder),
            msg.sender,
            OrderStatus.Processed
        );

        delete orders[_orderHash1];
        delete orders[_orderHash2];
    }

    function cancelOrder(Order memory _order, bytes32 _orderHash1) external {
        _verifyOrder(_order, msg.sender, orders[_orderHash1]);

        delete orders[_orderHash1];
    }
}
