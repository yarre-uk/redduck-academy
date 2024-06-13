// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "hardhat/console.sol";

struct Data {
    uint256 price;
    uint256 amount;
}

struct Node {
    bytes32 previous;
    Data data;
    bytes32 next;
}

contract VotingLinkedList {
    event AddEntry(bytes32 head, uint256 number, bytes32 name, bytes32 next);

    uint256 public length = 0;

    bytes32 public head;
    bytes32 public tail;
    mapping(bytes32 => Node) public objects;

    //TODO add votingId
    function getById(bytes32 id) public view returns (Data memory) {
        return objects[id].data;
    }

    function isNotEmpty(bytes32 id) public view returns (bool) {
        return objects[id].data.price != 0;
    }

    function getHead() public view returns (bytes32) {
        return head;
    }

    function getTail() public view returns (bytes32) {
        return tail;
    }

    function getId(
        uint256 _votingId,
        uint256 _price
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_votingId, _price));
    }

    function push(uint256 _votingId, uint256 _price, uint256 _amount) public {
        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, _amount);
        Node memory newObject = Node(tail, newData, bytes32(0));

        // console.log(_amount, getById(tail).amount);

        require(
            _amount > getById(tail).amount,
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

    function pushStart(
        uint256 _votingId,
        uint256 _price,
        uint256 amount
    ) public {
        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, amount);
        Node memory newObject = Node(bytes32(0), newData, head);

        // console.log(amount, getById(head).amount);

        require(
            amount < getById(head).amount,
            "Amount must be less than the head's amount"
        );

        if (tail == bytes32(0)) {
            tail = id;
        } else {
            objects[head].previous = id;
        }

        head = id;
        objects[id] = newObject;
        length++;
    }

    function insert(
        uint256 _votingId,
        bytes32 _prevId,
        uint256 _price,
        uint256 _amount
    ) public {
        require(head != bytes32(0), "List is empty");

        // console.logBytes32(_prevId);
        // console.log(
        //     objects[_prevId].data.amount,
        //     _amount,
        //     objects[objects[_prevId].next].data.amount
        // );

        if (_prevId == bytes32(0)) {
            pushStart(_votingId, _price, _amount);
            return;
        }

        require(
            _amount > objects[_prevId].data.amount ||
                objects[_prevId].previous == bytes32(0),
            "Amount must be greater than the previous node's amount"
        );
        require(
            _amount < objects[objects[_prevId].next].data.amount ||
                objects[_prevId].next == bytes32(0),
            "Amount must be less than the next node's amount"
        );

        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, _amount);
        Node memory newObject = Node(_prevId, newData, objects[_prevId].next);

        if (objects[_prevId].next == bytes32(0)) {
            tail = id;
        }
        if (_prevId == bytes32(0)) {
            newObject.next = head;
            head = id;
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
        delete objects[bytes32(0)];
        length = 0;
    }

    function traverse() public view {
        bytes32 current = head;
        uint256 i = 0;

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
