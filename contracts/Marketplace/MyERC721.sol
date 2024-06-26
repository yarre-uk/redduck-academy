// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyERC721 is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event Minted(address indexed owner, uint256 indexed tokenId);

    constructor() ERC721("NFTs", "NFT") Ownable(msg.sender) {}

    function createNFT(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    function burnNFT(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "ERC721: burn of token that is not owned"
        );
        _burn(tokenId);
    }
}
