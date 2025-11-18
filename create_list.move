module 0x0::create_list {
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use 0x0::todo_list::{Self, TodoList};

    public entry fun create_list(name: vector<u8>, ctx: &mut TxContext) {
        let list = todo_list::new(string::utf8(name), ctx);
        transfer::transfer(list, tx_context::sender(ctx));
    }
}