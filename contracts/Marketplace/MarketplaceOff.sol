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
    MyERC721 internal _nftContract;
    WETH internal _wethContract;

    mapping(uint256 => mapping(address => bool)) public ordered;
    mapping(bytes32 => bytes) public signatures;
    mapping(uint256 => bool) public nonces;

    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    event OrderCreated(
        bytes32 indexed id,
        address indexed sender,
        OrderType indexed orderType,
        uint256 price,
        uint256 nftId,
        uint256 createdAt,
        bytes signature
    );
    event OrderProcessed(
        bytes32 indexed sellOrderId,
        bytes32 indexed buyOrderId
    );
    event OrderCanceled(bytes32 indexed id, address indexed executer);

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

    function _getOrderId(Order memory _order) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _order.sender,
                    _order.nftId,
                    _order.orderType,
                    _order.price,
                    _order.createdAt
                )
            );
    }

    function _verifyOrder(
        Order memory _order,
        address _sender,
        uint256 _nonce,
        bytes memory _signature
    ) internal {
        require(nonces[_nonce] == false, "Marketplace: Invalid nonce");

        bytes32 message = keccak256(
            abi.encodePacked(
                _order.createdAt,
                _order.nftId,
                _order.orderType,
                _order.price,
                _order.sender,
                _order.status,
                block.chainid,
                _nonce,
                address(this)
            )
        );

        require(
            message.toEthSignedMessageHash().recover(_signature) == _sender,
            "Invalid signature"
        );

        nonces[_nonce] = true;
    }

    function createOrder(
        Order memory _order,
        bytes memory _signature,
        uint256 _nonce
    ) external returns (bytes32) {
        require(_order.price > 0, "Marketplace: Invalid price");
        require(
            _nftContract.ownerOf(_order.nftId) == msg.sender ||
                _order.orderType == OrderType.Buy,
            "Marketplace: Not the owner of the NFT"
        );
        require(
            ordered[_order.nftId][msg.sender] != true,
            "Marketplace: NFT already ordered this way"
        );

        _verifyOrder(_order, msg.sender, _nonce, _signature);

        bytes32 _id = _getOrderId(_order);

        signatures[_id] = _signature;
        ordered[_order.nftId][msg.sender] = true;

        emit OrderCreated(
            _id,
            msg.sender,
            _order.orderType,
            _order.price,
            _order.nftId,
            block.number,
            _signature
        );

        return _id;
    }

    function processOrder(
        Order memory _sellOrder,
        Order memory _buyOrder,
        bytes32 _sellOrderId,
        bytes32 _buyOrderId,
        uint256 _nonce1,
        uint256 _nonce2
    ) external {
        _verifyOrder(_sellOrder, msg.sender, _nonce1, signatures[_sellOrderId]);
        _verifyOrder(
            _buyOrder,
            _buyOrder.sender,
            _nonce2,
            signatures[_buyOrderId]
        );

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

        emit OrderProcessed(_sellOrderId, _buyOrderId);

        delete signatures[_sellOrderId];
        delete signatures[_buyOrderId];
        delete ordered[_sellOrder.nftId][_sellOrder.sender];
        delete ordered[_sellOrder.nftId][_buyOrder.sender];
    }

    function cancelOrder(
        Order memory _order,
        bytes32 _id,
        uint256 _nonce
    ) external {
        _verifyOrder(_order, msg.sender, _nonce, signatures[_id]);

        emit OrderCanceled(_id, msg.sender);

        delete signatures[_id];
        delete ordered[_order.nftId][msg.sender];
    }
}
