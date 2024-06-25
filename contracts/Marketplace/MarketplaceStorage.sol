// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

enum OrderType {
    Sell,
    Buy
}

enum OrderStatus {
    Created,
    Processed
}

struct MarketplaceStorageState {
    mapping(bytes32 => Order) orders;
    bytes32 lastOrderId;
}

struct Order {
    address sender;
    uint256 price;
    uint256 createdAt;
    uint256 nftId;
    OrderType orderType;
    OrderStatus status;
}

library ProposalStorage {
    function getId(Order memory _params) internal pure returns (bytes32) {
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

    function isEmpty(
        MarketplaceStorageState storage state,
        bytes32 id
    ) internal view returns (bool) {
        return state.orders[id].sender == address(0);
    }

    function addData(
        MarketplaceStorageState storage state,
        Order memory proposal
    ) internal returns (bytes32 id) {
        id = getId(proposal);
        state.orders[id] = proposal;
        state.lastOrderId = id;
    }

    function getData(
        MarketplaceStorageState storage state,
        bytes32 id
    ) internal view returns (Order storage) {
        return state.orders[id];
    }
}
