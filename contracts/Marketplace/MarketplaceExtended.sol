// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { MarketplaceOff } from "./MarketplaceOff.sol";
import { MyERC721 } from "./utils/MyERC721.sol";
import { WETH } from "../utils/WETH.sol";

contract MarketplaceExtended is MarketplaceOff {
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

    function setOrdered(
        uint256 _nftId,
        address _user,
        bool _value
    ) external onlyOwner {
        ordered[_nftId][_user] = _value;
    }

    function setOrders(bytes32 _id, bytes memory _value) external onlyOwner {
        signatures[_id] = _value;
    }
}
