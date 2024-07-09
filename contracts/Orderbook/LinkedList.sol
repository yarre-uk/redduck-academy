// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "hardhat/console.sol";

struct OrderData {
    uint256 price; // 1:1
    uint256 amount;
    address owner;
    uint256 createdAt;
}

struct Node {
    bytes32 previous;
    OrderData data;
    bytes32 next;
}

struct LinkedListState {
    uint256 length;
    bytes32 head;
    bytes32 tail;
    mapping(bytes32 => Node) objects;
}

library LinkedListLibrary {
    event AddEntry(bytes32 head, uint256 number, bytes32 name, bytes32 next);

    function getById(
        LinkedListState storage _state,
        bytes32 _id
    ) internal view returns (OrderData storage) {
        return _state.objects[_id].data;
    }

    function isNotEmpty(
        LinkedListState storage _state,
        bytes32 id
    ) internal view returns (bool) {
        return _state.objects[id].data.price != 0;
    }

    function getLength(
        LinkedListState storage _state
    ) internal view returns (uint256) {
        return _state.length;
    }

    function getHead(
        LinkedListState storage _state
    ) internal view returns (OrderData storage) {
        return getById(_state, _state.head);
    }

    function getTail(
        LinkedListState storage _state
    ) internal view returns (OrderData storage) {
        return getById(_state, _state.tail);
    }

    function getId(OrderData memory _data) internal pure returns (bytes32) {
        return keccak256(abi.encode(_data.price, _data.amount, _data.owner));
    }

    function push(
        LinkedListState storage _state,
        OrderData memory _data
    ) internal returns (bytes32 id) {
        id = getId(_data);
        Node memory newObject = Node(_state.tail, _data, bytes32(0));

        require(
            _data.price > getById(_state, _state.tail).price,
            "Price must be greater than the previous node's price"
        );

        if (_state.head == bytes32(0)) {
            _state.head = id;
        } else {
            _state.objects[_state.tail].next = id;
        }

        _state.tail = id;
        _state.objects[id] = newObject;
        _state.length++;
    }

    function pushStart(
        LinkedListState storage _state,
        OrderData memory _data
    ) internal returns (bytes32 id) {
        id = getId(_data);
        Node memory newObject = Node(bytes32(0), _data, _state.head);

        require(
            _state.tail == bytes32(0) ||
                _data.price < getById(_state, _state.head).price,
            "Price must be less than the head's price"
        );

        if (_state.tail == bytes32(0)) {
            _state.tail = id;
        } else {
            _state.objects[_state.head].previous = id;
        }

        _state.head = id;
        _state.objects[id] = newObject;
        _state.length++;
    }

    function insert(
        LinkedListState storage _state,
        bytes32 _prevId,
        OrderData memory _data
    ) internal returns (bytes32 id) {
        if (_prevId == bytes32(0)) {
            return pushStart(_state, _data);
        }

        if (_prevId == _state.tail) {
            return push(_state, _data);
        }

        require(
            _data.price > getById(_state, _prevId).price,
            "Price must be greater than the previous node's price"
        );
        require(
            _state.objects[_prevId].next == bytes32(0) ||
                _data.price <
                getById(_state, _state.objects[_prevId].next).price,
            "Price must be less than the next node's price"
        );

        id = getId(_data);
        Node memory newObject = Node(
            _prevId,
            _data,
            _state.objects[_prevId].next
        );

        if (_state.objects[_prevId].next == bytes32(0)) {
            _state.tail = id;
        }
        if (_prevId == bytes32(0)) {
            newObject.next = _state.head;
            _state.head = id;
        } else {
            _state.objects[_state.objects[_prevId].next].previous = id;
        }

        _state.objects[_prevId].next = id;
        _state.objects[id] = newObject;
        _state.length++;
    }

    function deleteNode(LinkedListState storage _state, bytes32 _id) internal {
        require(_state.head != bytes32(0), "List is empty");

        if (_state.objects[_id].previous == bytes32(0)) {
            _state.head = _state.objects[_id].next;
        } else {
            _state.objects[_state.objects[_id].previous].next = _state
                .objects[_id]
                .next;
        }

        if (_state.objects[_id].next == bytes32(0)) {
            _state.tail = _state.objects[_id].previous;
        } else {
            _state.objects[_state.objects[_id].next].previous = _state
                .objects[_id]
                .previous;
        }

        delete _state.objects[_id];
        _state.length--;
    }

    function clear(LinkedListState storage _state) internal {
        _state.head = bytes32(0);
        _state.tail = bytes32(0);
        delete _state.objects[bytes32(0)];
        _state.length = 0;
    }

    function traverse(LinkedListState storage _state) internal view {
        bytes32 current = _state.head;
        uint256 i = 0;
        console.log("  -s-  ");
        while (current != bytes32(0)) {
            OrderData storage data = getById(_state, current);
            console.logBytes32(current);
            console.log("Amount -> ", data.amount);
            console.log("Price -> ", data.price);
            console.log("Owner -> ", data.owner);
            console.log("Created At -> ", data.createdAt);
            current = _state.objects[current].next;
            i++;
        }
        console.log("  -e-  ");
    }
}
