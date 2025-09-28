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
## Tech Stack

Frontend: React, TypeScript, Lucide Icons, CSS

Blockchain: SUI Devnet

Smart Contract: Move Language

UI Design: Card-based professional layout

## Getting Started
1. Clone the Repository
git clone https://github.com/ugyenma/SUI-todochain.git
cd SUI-todochain/sources

2. Install Dependencies
npm install

3. Build the SUI Move Module
sui move build

4. Publish the Module to SUI Devnet

Make sure you have enough SUI in your wallet:

sui client publish --gas-budget 10000000


Save the Package ID after publishing for frontend integration.

5. Run the Frontend
npm start


Open http://localhost:3000
 in your browser.

## Usage

Connect your SUI wallet.

Create a new Todo List.

Add todo items using the input box.

Remove items individually or delete the entire list.

All data is stored on the SUI blockchain.
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



