// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

struct Data {
    uint256 price;
    uint256 amount;
}

struct Node {
    bytes32 previous;
    Data data;
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
    ) public view returns (Data memory) {
        return _state.objects[_id].data;
    }

    function isNotEmpty(
        LinkedListState storage _state,
        bytes32 id
    ) public view returns (bool) {
        return _state.objects[id].data.price != 0;
    }

    function getHead(
        LinkedListState storage _state
    ) public view returns (bytes32) {
        return _state.head;
    }

    function getTail(
        LinkedListState storage _state
    ) public view returns (bytes32) {
        return _state.tail;
    }

    function getId(
        uint256 _votingId,
        uint256 _price
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_votingId, _price));
    }

    function push(
        LinkedListState storage _state,
        uint256 _votingId,
        uint256 _price,
        uint256 _amount
    ) public {
        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, _amount);
        Node memory newObject = Node(_state.tail, newData, bytes32(0));

        require(
            _amount > getById(_state, _state.tail).amount,
            "Amount must be greater than the previous node's amount"
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
        uint256 _votingId,
        uint256 _price,
        uint256 amount
    ) public {
        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, amount);
        Node memory newObject = Node(bytes32(0), newData, _state.head);

        // console.log(amount, getById(head).amount);

        require(
            amount < getById(_state, _state.head).amount,
            "Amount must be less than the head's amount"
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
        uint256 _votingId,
        bytes32 _prevId,
        uint256 _price,
        uint256 _amount
    ) public {
        require(_state.head != bytes32(0), "List is empty");

        if (_prevId == bytes32(0)) {
            pushStart(_state, _votingId, _price, _amount);
            return;
        }

        require(
            _amount > _state.objects[_prevId].data.amount ||
                _state.objects[_prevId].previous == bytes32(0),
            "Amount must be greater than the previous node's amount"
        );
        require(
            _amount <
                _state.objects[_state.objects[_prevId].next].data.amount ||
                _state.objects[_prevId].next == bytes32(0),
            "Amount must be less than the next node's amount"
        );

        bytes32 id = getId(_votingId, _price);
        Data memory newData = Data(_price, _amount);
        Node memory newObject = Node(
            _prevId,
            newData,
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

    function deleteNode(LinkedListState storage _state, bytes32 id) public {
        require(_state.head != bytes32(0), "List is empty");

        if (_state.objects[id].previous == bytes32(0)) {
            _state.head = _state.objects[id].next;
        } else {
            _state.objects[_state.objects[id].previous].next = _state
                .objects[id]
                .next;
        }

        if (_state.objects[id].next == bytes32(0)) {
            _state.tail = _state.objects[id].previous;
        } else {
            _state.objects[_state.objects[id].next].previous = _state
                .objects[id]
                .previous;
        }

        delete _state.objects[id];
        _state.length--;
    }

    function clear(LinkedListState storage _state) public {
        _state.head = bytes32(0);
        _state.tail = bytes32(0);
        delete _state.objects[bytes32(0)];
        _state.length = 0;
    }
}
