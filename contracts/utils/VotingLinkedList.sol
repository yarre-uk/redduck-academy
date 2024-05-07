// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "hardhat/console.sol";

struct Data {
    uint price;
    uint amount;
}

struct Node {
    bytes32 previous;
    Data data;
    bytes32 next;
}

contract VotingLinkedList {
    event AddEntry(bytes32 head, uint number, bytes32 name, bytes32 next);

    uint public length = 0;

    bytes32 public head;
    bytes32 public tail;
    mapping(bytes32 => Node) public objects;

    //TODO add votingId
    function getById(bytes32 id) public view returns (Data memory) {
        return objects[id].data;
    }

    function getHead() public view returns (bytes32) {
        return head;
    }

    function getTail() public view returns (bytes32) {
        return tail;
    }

    function getId(uint _price) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_price));
    }

    function push(uint price, uint amount) public {
        bytes32 id = getId(price);
        Data memory newData = Data(price, amount);
        Node memory newObject = Node(tail, newData, bytes32(0));

        require(
            amount > getById(tail).amount,
            "Amount must be greater than the previous node's amount"
        );

        if (head == bytes32(0)) {
            head = id;
        } else {
            objects[tail].next = id;
        }

        tail = id;
        objects[id] = newObject;
        length++;
    }

    function insert(bytes32 _prevId, uint256 _price, uint256 _amount) public {
        require(head != bytes32(0), "List is empty");

        // console.logBytes32(_prevId);
        // console.log(
        //     objects[_prevId].data.amount,
        //     _amount,
        //     objects[objects[_prevId].next].data.amount
        // );

        require(
            _amount > objects[_prevId].data.amount,
            "Amount must be greater than the previous node's amount"
        );
        require(
            _amount < objects[objects[_prevId].next].data.amount,
            "Amount must be less than the next node's amount"
        );

        bytes32 id = getId(_price);
        Data memory newData = Data(_price, _amount);
        Node memory newObject = Node(_prevId, newData, objects[_prevId].next);

        if (objects[_prevId].next == bytes32(0)) {
            tail = id;
        } else {
            objects[objects[_prevId].next].previous = id;
        }

        objects[_prevId].next = id;
        objects[id] = newObject;
        length++;
    }

    function deleteNode(bytes32 id) public {
        require(head != bytes32(0), "List is empty");

        if (objects[id].previous == bytes32(0)) {
            head = objects[id].next;
        } else {
            objects[objects[id].previous].next = objects[id].next;
        }

        if (objects[id].next == bytes32(0)) {
            tail = objects[id].previous;
        } else {
            objects[objects[id].next].previous = objects[id].previous;
        }

        delete objects[id];
        length--;
    }

    function clear() public {
        head = bytes32(0);
        tail = bytes32(0);
        length = 0;
    }

    function traverse() public view {
        bytes32 current = head;
        uint i = 0;

        while (current != bytes32(0)) {
            console.log("Node ", i);
            console.log("   ID: ");
            console.logBytes32(current);
            console.log("   Price: ", objects[current].data.price);
            console.log("   Amount: ", objects[current].data.amount);
            current = objects[current].next;
            i++;
        }
    }
}
