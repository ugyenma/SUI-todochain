module 0x0::todo_list {
use sui::transfer;
use sui::object::{Self, UID};
use sui::tx_context::{Self, TxContext};
use std::string::{Self, String};

/// A single todo item with details
public struct TodoItem has store, drop, copy {
    description: String,
    assigned_to: String,
    deadline: u64, // timestamp in milliseconds
    completed: bool,
}

/// List of todos. Can be managed by the owner and shared with others.
public struct TodoList has key, store {
    id: UID,
    name: String,
    items: vector<TodoItem>
}

/// Create a new todo list with a name.
public fun new(name: String, ctx: &mut TxContext): TodoList {
    let list = TodoList {
        id: object::new(ctx),
        name,
        items: vector[]
    };

    (list)
}

/// Add a new todo item to the list with assignment and deadline.
public fun add(
    list: &mut TodoList, 
    description: String, 
    assigned_to: String, 
    deadline: u64
) {
    let item = TodoItem {
        description,
        assigned_to,
        deadline,
        completed: false,
    };
    list.items.push_back(item);
}

/// Edit an existing todo item by index.
public fun edit(
    list: &mut TodoList, 
    index: u64, 
    description: String, 
    assigned_to: String, 
    deadline: u64
) {
    let item = &mut list.items[index];
    item.description = description;
    item.assigned_to = assigned_to;
    item.deadline = deadline;
}

/// Edit only the description of a todo item.
public fun edit_description(list: &mut TodoList, index: u64, description: String) {
    let item = &mut list.items[index];
    item.description = description;
}

/// Edit only the assigned person of a todo item.
public fun edit_assigned_to(list: &mut TodoList, index: u64, assigned_to: String) {
    let item = &mut list.items[index];
    item.assigned_to = assigned_to;
}

/// Edit only the deadline of a todo item.
public fun edit_deadline(list: &mut TodoList, index: u64, deadline: u64) {
    let item = &mut list.items[index];
    item.deadline = deadline;
}

/// Mark a todo item as completed.
public fun mark_completed(list: &mut TodoList, index: u64) {
    let item = &mut list.items[index];
    item.completed = true;
}

/// Mark a todo item as incomplete.
public fun mark_incomplete(list: &mut TodoList, index: u64) {
    let item = &mut list.items[index];
    item.completed = false;
}

/// Remove a todo item from the list by index.
public fun remove(list: &mut TodoList, index: u64): TodoItem {
    list.items.remove(index)
}

/// Delete the list and the capability to manage it.
public fun delete(list: TodoList) {
    let TodoList { id, name: _, items: _ } = list;
    id.delete();
}

/// Get the number of items in the list.
public fun length(list: &TodoList): u64 {
    list.items.length()
}

/// Get the name of the todo list.
public fun get_name(list: &TodoList): String {
    list.name
}

/// Rename the todo list.
public fun rename(list: &mut TodoList, new_name: String) {
    list.name = new_name;
}

/// Get item description by index.
public fun get_description(list: &TodoList, index: u64): String {
    list.items[index].description
}

/// Get item assigned person by index.
public fun get_assigned_to(list: &TodoList, index: u64): String {
    list.items[index].assigned_to
}

/// Get item deadline by index.
public fun get_deadline(list: &TodoList, index: u64): u64 {
    list.items[index].deadline
}

/// Check if item is completed by index.
public fun is_completed(list: &TodoList, index: u64): bool {
    list.items[index].completed
}

/// Get all items assigned to a specific person.
public fun get_items_for_person(list: &TodoList, person: String): vector<u64> {
    let mut indices = vector[];
    let mut i = 0;
    let len = list.items.length();
    
    while (i < len) {
        if (list.items[i].assigned_to == person) {
            indices.push_back(i);
        };
        i = i + 1;
    };
    
    indices
}

/// Get all overdue items (deadline passed current time).
public fun get_overdue_items(list: &TodoList, current_time: u64): vector<u64> {
    let mut indices = vector[];
    let mut i = 0;
    let len = list.items.length();
    
    while (i < len) {
        if (list.items[i].deadline < current_time && !list.items[i].completed) {
            indices.push_back(i);
        };
        i = i + 1;
    };
    
    indices
}

// Entry functions for interacting with the contract

public entry fun create_list(name: vector<u8>, ctx: &mut TxContext) {
    let list = new(string::utf8(name), ctx);
    transfer::transfer(list, tx_context::sender(ctx));
}

public entry fun add_task(
    list: &mut TodoList,
    description: vector<u8>,
    assigned_to: vector<u8>,
    deadline: u64,
    _ctx: &mut TxContext
) {
    add(list, string::utf8(description), string::utf8(assigned_to), deadline);
}

public entry fun complete_task(
    list: &mut TodoList,
    index: u64,
    _ctx: &mut TxContext
) {
    mark_completed(list, index);
}

public entry fun update_task(
    list: &mut TodoList,
    index: u64,
    description: vector<u8>,
    assigned_to: vector<u8>,
    deadline: u64,
    _ctx: &mut TxContext
) {
    edit(list, index, string::utf8(description), string::utf8(assigned_to), deadline);
}

public entry fun remove_task(
    list: &mut TodoList,
    index: u64,
    _ctx: &mut TxContext
) {
    remove(list, index);
}
}