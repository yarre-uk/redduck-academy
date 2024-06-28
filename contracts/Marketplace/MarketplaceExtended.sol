// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Marketplace } from "./Marketplace.sol";
import { MyERC721 } from "./MyERC721.sol";
import { WETH } from "./WETH.sol";
import { Order, ProposalStorage, MarketplaceStorageState } from "./MarketplaceStorage.sol";

contract MarketplaceExtended is Marketplace {
    using ProposalStorage for MarketplaceStorageState;

    function setNFTContract(MyERC721 _tokenNft) external onlyOwner {
        require(
            address(_tokenNft) != address(0),
            "Marketplace: Invalid NFT contract address"
        );

        _nftContract = _tokenNft;
    }

    function setWETHContract(WETH _tokenWeth) external onlyOwner {
        require(
            address(_tokenWeth) != address(0),
            "Marketplace: Invalid WETH contract address"
        );

        _wethContract = _tokenWeth;
    }

    function getOrder(
        bytes32 _orderId
    ) external view returns (Order memory order) {
        return _ordersState.getData(_orderId);
    }

    function getOrders(
        bytes32 _ids
    ) external view returns (Order[] memory orders) {
        Order[] memory _orders = new Order[](_ids.length);

        for (uint256 i = 0; i < _ids.length; i++) {
            _orders[i] = _ordersState.getData(_ids[i]);
        }

        return _orders;
    }
}
