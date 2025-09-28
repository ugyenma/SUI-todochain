# Web3 Todo List on SUI Blockchain

A decentralized Todo List application built on the **SUI blockchain**, allowing users to create, manage, and delete todo lists on-chain. The frontend is built with **React + TypeScript**, and the backend uses a **SUI Move smart contract**.

---

## Features

- Connect and disconnect a SUI wallet.
- Create a new Todo List stored on SUI blockchain.
- Add and remove Todo items in real-time.
- Delete the entire Todo List.
- View Todo List ID and total items.
- Professional card-style UI for a clean, modern look.

---

## Smart Contract

The `todo::todo_list` Move module manages the on-chain Todo List:

```move
module todo::todo_list;

use std::string::String;

public struct TodoList has key, store {
    id: UID,
    items: vector<String>
}

public fun new(ctx: &mut TxContext): TodoList {
    let list = TodoList { id: object::new(ctx), items: vector[] };
    (list)
}

public fun add(list: &mut TodoList, item: String) { list.items.push_back(item); }
public fun remove(list: &mut TodoList, index: u64): String { list.items.remove(index) }
public fun delete(list: TodoList) { let TodoList { id, items: _ } = list; id.delete(); }
public fun length(list: &TodoList): u64 { list.items.length() }
