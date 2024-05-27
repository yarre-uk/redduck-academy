// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "hardhat/console.sol";

contract MyProxy is Ownable, Proxy {
    constructor(address _initialImplementation) Ownable(msg.sender) {
        uint256 implementationPos = implementationPosition;

        assembly {
            sstore(implementationPos, _initialImplementation)
        }
    }

    uint256 constant implementationPosition =
        uint256(keccak256("eip1967.proxy.implementation")) - 1;

    function setImplementation(
        address _implementationAddress
    ) external onlyOwner {
        uint256 implementationPos = implementationPosition;

        assembly {
            sstore(implementationPos, _implementationAddress)
        }
    }

    function _implementation()
        internal
        view
        virtual
        override
        returns (address impl)
    {
        uint256 implPosition = implementationPosition;

        console.log("--------", implementationPosition);

        assembly {
            impl := sload(implPosition)
        }
    }

    receive() external payable {
        _fallback();
    }
}
