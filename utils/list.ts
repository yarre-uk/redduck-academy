import { ethers } from "hardhat";

export const EMPTY_BYTES32 = "0x" + "0".repeat(64);

export class Data {
  price: number;
  amount: number;

  constructor(price: number, amount: number) {
    this.price = price;
    this.amount = amount;
  }
}

export class ListNode {
  previous: string | null;
  data: Data;
  next: string | null;

  constructor(previous: string | null, data: Data, next: string | null) {
    this.previous = previous;
    this.data = data;
    this.next = next;
  }
}

export class VotingLinkedList {
  // length: number;
  // head: string | null;
  // tail: string | null;
  // objects: { [key: string]: ListNode };

  // constructor() {
  //   this.length = 0;
  //   this.head = null;
  //   this.tail = null;
  //   this.objects = {};
  // }

  // getById(id: string): Data {
  //   return this.objects[id].data;
  // }

  // getHead(): string | null {
  //   return this.head;
  // }

  // getTail(): string | null {
  //   return this.tail;
  // }

  getId(votingId: number, price: number): string {
    return ethers.keccak256(
      ethers.solidityPacked(["uint256", "uint256"], [votingId, price]),
    );
  }

  // push(votingId: number, price: number, amount: number) {
  //   const id = this.getId(votingId, price);
  //   const newData = new Data(price, amount);
  //   const newObject = new ListNode(this.tail, newData, null);

  //   if (this.tail && this.getById(this.tail).amount >= amount) {
  //     throw new Error("Amount must be greater than the previous node's amount");
  //   }

  //   if (this.head === null) {
  //     this.head = id;
  //   } else if (this.tail) {
  //     this.objects[this.tail].next = id;
  //   }

  //   this.tail = id;
  //   this.objects[id] = newObject;
  //   this.length++;

  //   return newObject.previous ?? EMPTY_BYTES32;
  // }

  // insert(prevId: string, price: number, amount: number) {
  //   if (this.head === null) {
  //     throw new Error("List is empty");
  //   }

  //   const prevAmount = this.getById(prevId).amount;
  //   const nextAmount = this.getById(
  //     this.objects[prevId].next ?? EMPTY_BYTES32,
  //   )?.amount;

  //   if (prevAmount >= amount || amount >= nextAmount) {
  //     throw new Error(
  //       "Amount must be between the previous and next node's amounts",
  //     );
  //   }

  //   const id = this.getId(price);
  //   const newData = new Data(price, amount);
  //   const newObject = new ListNode(prevId, newData, this.objects[prevId].next);

  //   if (this.objects[prevId].next === null) {
  //     this.tail = id;
  //   } else {
  //     this.objects[this.objects[prevId].next ?? EMPTY_BYTES32].previous = id;
  //   }

  //   this.objects[prevId].next = id;
  //   this.objects[id] = newObject;
  //   this.length++;

  //   return prevId ?? EMPTY_BYTES32;
  // }

  // deleteListNode(id: string): void {
  //   if (this.head === null) {
  //     throw new Error("List is empty");
  //   }

  //   if (this.objects[id].previous === null) {
  //     this.head = this.objects[id].next;
  //   } else {
  //     this.objects[this.objects[id].previous ?? EMPTY_BYTES32].next =
  //       this.objects[id].next;
  //   }

  //   if (this.objects[id].next === null) {
  //     this.tail = this.objects[id].previous;
  //   } else {
  //     this.objects[this.objects[id].next ?? EMPTY_BYTES32].previous =
  //       this.objects[id].previous;
  //   }

  //   delete this.objects[id];
  //   this.length--;
  // }

  // clear(): void {
  //   this.head = null;
  //   this.tail = null;
  //   this.length = 0;
  // }
}
