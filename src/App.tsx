import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, CheckCircle } from 'lucide-react';
import './index.css';

// --- Interfaces ---
interface SuiAccount {
  address: string;
  publicKey: string;
}

interface TodoItem {
  id: string;
  content: string;
  index: number;
}

interface TodoListObject {
  id: string;
  items: string[];
}

// --- Mock Sui Client ---
class MockSuiClient {
  private todoLists: Map<string, TodoListObject> = new Map();
  private currentId = 0;

  async createTodoList(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const id = `0x${this.currentId.toString(16).padStart(40, '0')}`;
    this.currentId++;
    this.todoLists.set(id, { id, items: [] });
    return id;
  }

  async addTodo(listId: string, item: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list) list.items.push(item);
  }

  async removeTodo(listId: string, index: number): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) return list.items.splice(index, 1)[0];
    throw new Error('Invalid index');
  }

  async getTodoList(listId: string): Promise<TodoListObject | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.todoLists.get(listId) || null;
  }

  async deleteTodoList(listId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.todoLists.delete(listId);
  }
}

// --- App Component ---
const TodoListApp = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<SuiAccount | null>(null);
  const [suiClient] = useState(new MockSuiClient());

  // --- Wallet ---
  const connectWallet = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockAccount: SuiAccount = {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        publicKey: '0x' + Math.random().toString(16).substr(2, 64),
      };
      setAccount(mockAccount);
      setError(null);
    } catch {
      setError('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setTodoListId(null);
    setTodos([]);
  };

  // --- Todo List Management ---
  const createTodoList = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const listId = await suiClient.createTodoList();
      setTodoListId(listId);
      setTodos([]);
    } catch {
      setError('Failed to create todo list');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!account || !todoListId || !newTodo.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await suiClient.addTodo(todoListId, newTodo.trim());
      setNewTodo('');
      await fetchTodoList();
    } catch {
      setError('Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  const removeTodo = async (index: number) => {
    if (!account || !todoListId) return;
    setLoading(true);
    setError(null);
    try {
      await suiClient.removeTodo(todoListId, index);
      await fetchTodoList();
    } catch {
      setError('Failed to remove todo');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodoList = async () => {
    if (!todoListId) return;
    try {
      const list = await suiClient.getTodoList(todoListId);
      if (list) {
        const todoItems: TodoItem[] = list.items.map((item, index) => ({
          id: `${todoListId}-${index}`,
          content: item,
          index,
        }));
        setTodos(todoItems);
      }
    } catch {
      setError('Failed to fetch todo list');
    }
  };

  const deleteTodoList = async () => {
    if (!account || !todoListId) return;
    setLoading(true);
    setError(null);
    try {
      await suiClient.deleteTodoList(todoListId);
      setTodoListId(null);
      setTodos([]);
    } catch {
      setError('Failed to delete todo list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (todoListId) fetchTodoList();
  }, [todoListId]);

  return (
    <div className="app-container">
      <div className="card main-card">
        {/* Header */}
        <div className="card-header">
          <h1>SUI Todo List</h1>
          <p>Manage your tasks on the Sui blockchain</p>
        </div>

        {/* Wallet */}
        <div className="card-section wallet-section">
          <div className="wallet-info">
            <Wallet className="icon" />
            <span>
              {account
                ? `Connected: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                : 'Not Connected'}
            </span>
          </div>
          {account ? (
            <button onClick={disconnectWallet} className="btn btn-danger">
              Disconnect
            </button>
          ) : (
            <button onClick={connectWallet} className="btn btn-primary">
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && <div className="error-message">{error}</div>}

        {/* Todo List Section */}
        {account && (
          <div className="card-section">
            {!todoListId ? (
              <button
                onClick={createTodoList}
                className="btn btn-primary-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Todo List'}
              </button>
            ) : (
              <>
                {/* Add Todo */}
                <div className="add-todo">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter a new todo..."
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <button
                    onClick={addTodo}
                    disabled={!newTodo.trim() || loading}
                    className="btn btn-success"
                  >
                    <Plus className="icon-small" /> Add
                  </button>
                </div>

                {/* Todos */}
                <div className="todo-list">
                  {todos.length === 0 ? (
                    <div className="empty-state">
                      <CheckCircle className="icon-large" />
                      <p>No todos yet. Add one above!</p>
                    </div>
                  ) : (
                    todos.map((todo, index) => (
                      <div key={todo.id} className="todo-item">
                        <span>
                          #{index + 1} {todo.content}
                        </span>
                        <button
                          className="btn btn-delete"
                          onClick={() => removeTodo(todo.index)}
                        >
                          <Trash2 className="icon-small" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Delete List */}
                <div className="mt-4 text-right">
                  <button
                    onClick={deleteTodoList}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    Delete List
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoListApp;
