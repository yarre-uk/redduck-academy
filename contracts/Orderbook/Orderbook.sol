// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { WETH } from "../utils/WETH.sol";
import { MyERC1155 } from "./MyERC1155.sol";

contract Orderbook is Ownable, AccessControl, Initializable {
    MyERC1155 public ercContract;
    WETH public wethContract;
    uint256[] public allowedTokensForTrade;

    constructor() Ownable(msg.sender) {}

    function initialize(
        MyERC1155 _erc1155,
        WETH _weth
    ) public virtual initializer onlyOwner {
        require(
            address(_erc1155) != address(0),
            "Orderbook: Invalid ERC1155 contract address"
        );
        require(
            address(_weth) != address(0),
            "Orderbook: Invalid WETH contract address"
        );

        ercContract = _erc1155;
        wethContract = _weth;
    }

    function setAllowedTokensForTrade(
        uint256[] memory _tokens
    ) external onlyOwner {
        allowedTokensForTrade = _tokens;
    }
}
