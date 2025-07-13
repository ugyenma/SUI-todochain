import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import  './index.css';
// Mock Sui SDK functionality for demonstration
// In a real implementation, you would use the actual Sui SDK
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

// Simulated Sui client for demonstration
class MockSuiClient {
  private todoLists: Map<string, TodoListObject> = new Map();
  private currentId = 0;

  async createTodoList(): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const id = `0x${this.currentId.toString(16).padStart(40, '0')}`;
    this.currentId++;
    
    this.todoLists.set(id, {
      id,
      items: []
    });
    
    return id;
  }

  async addTodo(listId: string, item: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const list = this.todoLists.get(listId);
    if (list) {
      list.items.push(item);
    }
  }

  async removeTodo(listId: string, index: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) {
      return list.items.splice(index, 1)[0];
    }
    throw new Error('Invalid index');
  }

  async getTodoList(listId: string): Promise<TodoListObject | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.todoLists.get(listId) || null;
  }

  async deleteTodoList(listId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.todoLists.delete(listId);
  }
}

const TodoListApp = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<SuiAccount | null>(null);
  const [suiClient] = useState(new MockSuiClient());

  // Simulate wallet connection
  const connectWallet = async () => {
    setLoading(true);
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAccount: SuiAccount = {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        publicKey: '0x' + Math.random().toString(16).substr(2, 64)
      };
      
      setAccount(mockAccount);
      setError(null);
    } catch (err) {
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

  // Create a new todo list
  const createTodoList = async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const listId = await suiClient.createTodoList();
      setTodoListId(listId);
      setTodos([]);
    } catch (err) {
      setError('Failed to create todo list');
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo item
  const addTodo = async () => {
    if (!account || !todoListId || !newTodo.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await suiClient.addTodo(todoListId, newTodo.trim());
      setNewTodo('');
      await fetchTodoList();
    } catch (err) {
      setError('Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  // Remove a todo item
  const removeTodo = async (index: number) => {
    if (!account || !todoListId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await suiClient.removeTodo(todoListId, index);
      await fetchTodoList();
    } catch (err) {
      setError('Failed to remove todo');
    } finally {
      setLoading(false);
    }
  };

  // Fetch todo list data
  const fetchTodoList = async () => {
    if (!todoListId) return;
    
    try {
      const list = await suiClient.getTodoList(todoListId);
      
      if (list) {
        const todoItems: TodoItem[] = list.items.map((item: string, index: number) => ({
          id: `${todoListId}-${index}`,
          content: item,
          index: index,
        }));
        
        setTodos(todoItems);
      }
    } catch (err) {
      setError('Failed to fetch todo list');
    }
  };

  // Delete the entire todo list
  const deleteTodoList = async () => {
    if (!account || !todoListId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await suiClient.deleteTodoList(todoListId);
      setTodoListId(null);
      setTodos([]);
    } catch (err) {
      setError('Failed to delete todo list');
    } finally {
      setLoading(false);
    }
  };

  // Fetch todo list when todoListId changes
  useEffect(() => {
    if (todoListId) {
      fetchTodoList();
    }
  }, [todoListId]);



// ... (keep all your existing interfaces and MockSuiClient class)


  return (
    <div className="app-container min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with gradient text */}
          <div className="glass-card p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Sui Todo List
            </h1>
            <p className="text-gray-200 text-lg">
              Manage your todos on the Sui blockchain
            </p>
          </div>

        

          {/* Wallet Connection */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-indigo-300" />
                <span className="text-lg font-medium text-white">
                  {account ? `Connected: ${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Not Connected'}
                </span>
              </div>
              {account ? (
                <button
                  onClick={disconnectWallet}
                  className="btn-danger"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="glass-card bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {account && (
            <>
              {/* Todo List Management */}
              {!todoListId ? (
                <div className="glass-card p-8 mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Create Your Todo List
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Create a new todo list stored on the Sui blockchain
                  </p>
                  <button
                    onClick={createTodoList}
                    disabled={loading}
                    className="btn-primary-lg"
                  >
                    {loading ? 'Creating...' : 'Create Todo List'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Add Todo Form */}
                  <div className="glass-card p-6 mb-6">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Enter a new todo item..."
                        className="input-field"
                        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                      />
                      <button
                        onClick={addTodo}
                        disabled={loading || !newTodo.trim()}
                        className="btn-success"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Todo List */}
                  <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-white">
                        Your Todos ({todos.length})
                      </h2>
                      <button
                        onClick={deleteTodoList}
                        disabled={loading}
                        className="btn-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete List</span>
                      </button>
                    </div>

                    {todos.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4 empty-state-icon" />
                        <p className="text-gray-400 text-lg">
                          No todos yet. Add one above!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todos.map((todo, index) => (
                          <div
                            key={todo.id}
                            className="todo-item"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-300 font-medium">
                                #{index + 1}
                              </span>
                              <span className="text-white">
                                {todo.content}
                              </span>
                            </div>
                            <button
                              onClick={() => removeTodo(todo.index)}
                              disabled={loading}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Todo List Info */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Todo List Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">List ID:</span>
                        <span className="font-mono text-xs bg-gray-800/50 px-2 py-1 rounded text-white">
                          {todoListId?.slice(0, 8)}...{todoListId?.slice(-8)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Items:</span>
                        <span className="font-medium text-white">{todos.length}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoListApp;