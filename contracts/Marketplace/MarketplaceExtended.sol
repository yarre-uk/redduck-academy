// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Marketplace } from "./Marketplace.sol";
import { MyERC721 } from "./MyERC721.sol";
import { WETH } from "./WETH.sol";

contract MarketplaceExtended is Marketplace {
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
}
