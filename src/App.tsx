import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, CheckCircle, Edit2, Save, X, Calendar, User, List } from 'lucide-react';
import './index.css';

// --- Interfaces ---
interface SuiAccount {
  address: string;
  publicKey: string;
}

interface TodoItem {
  id: string;
  description: string;
  assignedTo: string;
  deadline: number;
  completed: boolean;
  index: number;
}

interface TodoListObject {
  id: string;
  name: string;
  items: TodoItem[];
}

// --- Mock Sui Client ---
class MockSuiClient {
  private todoLists: Map<string, TodoListObject> = new Map();
  private currentId = 0;

  async createTodoList(name: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const id = `0x${this.currentId.toString(16).padStart(40, '0')}`;
    this.currentId++;
    this.todoLists.set(id, { id, name, items: [] });
    return id;
  }

  async addTodo(listId: string, description: string, assignedTo: string, deadline: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list) {
      list.items.push({
        id: `${listId}-${list.items.length}`,
        description,
        assignedTo,
        deadline,
        completed: false,
        index: list.items.length
      });
    }
  }

  async editTodo(listId: string, index: number, description: string, assignedTo: string, deadline: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) {
      list.items[index] = { ...list.items[index], description, assignedTo, deadline };
    }
  }

  async markCompleted(listId: string, index: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) {
      list.items[index].completed = true;
    }
  }

  async markIncomplete(listId: string, index: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) {
      list.items[index].completed = false;
    }
  }

  async removeTodo(listId: string, index: number): Promise<TodoItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list && index < list.items.length) {
      const removed = list.items.splice(index, 1)[0];
      list.items.forEach((item, i) => { item.index = i; });
      return removed;
    }
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

  async getAllTodoLists(): Promise<TodoListObject[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Array.from(this.todoLists.values());
  }

  async renameTodoList(listId: string, newName: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = this.todoLists.get(listId);
    if (list) list.name = newName;
  }
}

// --- App Component ---
const TodoListApp = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [allLists, setAllLists] = useState<TodoListObject[]>([]);
  const [newTodo, setNewTodo] = useState({ description: '', assignedTo: '', deadline: '' });
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<SuiAccount | null>(null);
  const [suiClient] = useState(new MockSuiClient());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ description: '', assignedTo: '', deadline: '' });
  const [filterPerson, setFilterPerson] = useState('');

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
      await fetchAllLists();
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
    setAllLists([]);
  };

  // --- Todo List Management ---
  const createTodoList = async () => {
    if (!account || !listName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const listId = await suiClient.createTodoList(listName.trim());
      setTodoListId(listId);
      setTodos([]);
      setListName('');
      await fetchAllLists();
    } catch {
      setError('Failed to create todo list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLists = async () => {
    try {
      const lists = await suiClient.getAllTodoLists();
      setAllLists(lists);
    } catch {
      setError('Failed to fetch lists');
    }
  };

  const selectList = async (listId: string) => {
    setTodoListId(listId);
    await fetchTodoList(listId);
  };

  const addTodo = async () => {
    if (!account || !todoListId || !newTodo.description.trim() || !newTodo.assignedTo.trim() || !newTodo.deadline) return;
    setLoading(true);
    setError(null);
    try {
      const deadlineTimestamp = new Date(newTodo.deadline).getTime();
      await suiClient.addTodo(todoListId, newTodo.description.trim(), newTodo.assignedTo.trim(), deadlineTimestamp);
      setNewTodo({ description: '', assignedTo: '', deadline: '' });
      await fetchTodoList(todoListId);
    } catch {
      setError('Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (todo: TodoItem) => {
    setEditingIndex(todo.index);
    setEditForm({
      description: todo.description,
      assignedTo: todo.assignedTo,
      deadline: new Date(todo.deadline).toISOString().slice(0, 16)
    });
  };

  const saveEdit = async () => {
    if (!account || !todoListId || editingIndex === null) return;
    setLoading(true);
    setError(null);
    try {
      const deadlineTimestamp = new Date(editForm.deadline).getTime();
      await suiClient.editTodo(todoListId, editingIndex, editForm.description, editForm.assignedTo, deadlineTimestamp);
      setEditingIndex(null);
      await fetchTodoList(todoListId);
    } catch {
      setError('Failed to edit todo');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const toggleComplete = async (todo: TodoItem) => {
    if (!account || !todoListId) return;
    setLoading(true);
    setError(null);
    try {
      if (todo.completed) {
        await suiClient.markIncomplete(todoListId, todo.index);
      } else {
        await suiClient.markCompleted(todoListId, todo.index);
      }
      await fetchTodoList(todoListId);
    } catch {
      setError('Failed to update todo status');
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
      await fetchTodoList(todoListId);
    } catch {
      setError('Failed to remove todo');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodoList = async (listId: string) => {
    try {
      const list = await suiClient.getTodoList(listId);
      if (list) {
        setTodos(list.items);
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
      await fetchAllLists();
    } catch {
      setError('Failed to delete todo list');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTodos = () => {
    if (!filterPerson) return todos;
    return todos.filter(todo => todo.assignedTo.toLowerCase().includes(filterPerson.toLowerCase()));
  };

  const isOverdue = (deadline: number) => {
    return deadline < Date.now();
  };

  useEffect(() => {
    if (todoListId) fetchTodoList(todoListId);
  }, [todoListId]);

  const filteredTodos = getFilteredTodos();

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="main-card">
          {/* Header */}
          <div className="card-header">
            <h1>SUI Todo List</h1>
            <p>Manage your tasks on the Sui blockchain</p>
          </div>

          {/* Wallet */}
          <div className="wallet-section">
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

          {/* Main Content */}
          {account && (
            <div className="content-section">
              <div className="content-grid">
                {/* Sidebar - Lists */}
                <div className="sidebar">
                  <div className="sidebar-content">
                    <h2 className="sidebar-title">
                      <List className="icon-small" />
                      My Lists
                    </h2>
                    
                    {/* Create New List */}
                    <div className="create-list-section">
                      <input
                        type="text"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="New list name..."
                        className="input"
                        onKeyPress={(e) => e.key === 'Enter' && createTodoList()}
                      />
                      <button
                        onClick={createTodoList}
                        disabled={!listName.trim() || loading}
                        className="btn btn-success btn-full"
                      >
                        <Plus className="icon-small" /> Create List
                      </button>
                    </div>

                    {/* List of Lists */}
                    <div className="lists-container">
                      {allLists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => selectList(list.id)}
                          className={`list-item ${todoListId === list.id ? 'active' : ''}`}
                        >
                          <div className="list-name">{list.name}</div>
                          <div className="list-count">{list.items.length} tasks</div>
                        </button>
                      ))}
                      {allLists.length === 0 && (
                        <p className="empty-lists">No lists yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content - Todos */}
                <div className="main-content">
                  {todoListId ? (
                    <>
                      {/* Add Todo Form */}
                      <div className="add-todo-section">
                        <h3 className="section-title">Add New Task</h3>
                        <div className="add-todo-form">
                          <input
                            type="text"
                            value={newTodo.description}
                            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                            placeholder="Task description..."
                            className="input"
                          />
                          <div className="form-row">
                            <div className="input-group">
                              <User className="icon-small icon-gray" />
                              <input
                                type="text"
                                value={newTodo.assignedTo}
                                onChange={(e) => setNewTodo({ ...newTodo, assignedTo: e.target.value })}
                                placeholder="Assigned to..."
                                className="input"
                              />
                            </div>
                            <div className="input-group">
                              <Calendar className="icon-small icon-gray" />
                              <input
                                type="datetime-local"
                                value={newTodo.deadline}
                                onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
                                className="input"
                              />
                            </div>
                          </div>
                          <button
                            onClick={addTodo}
                            disabled={!newTodo.description.trim() || !newTodo.assignedTo.trim() || !newTodo.deadline || loading}
                            className="btn btn-primary btn-full"
                          >
                            <Plus className="icon-small" /> Add Task
                          </button>
                        </div>
                      </div>

                      {/* Filter */}
                      <div className="filter-section">
                        <input
                          type="text"
                          value={filterPerson}
                          onChange={(e) => setFilterPerson(e.target.value)}
                          placeholder="Filter by person..."
                          className="input"
                        />
                      </div>

                      {/* Todos */}
                      <div className="todos-container">
                        {filteredTodos.length === 0 ? (
                          <div className="empty-state">
                            <CheckCircle className="icon-large" />
                            <p>
                              {filterPerson ? 'No tasks found for this person' : 'No tasks yet. Add one above!'}
                            </p>
                          </div>
                        ) : (
                          filteredTodos.map((todo) => (
                            <div
                              key={todo.id}
                              className={`todo-card ${
                                todo.completed
                                  ? 'completed'
                                  : isOverdue(todo.deadline)
                                  ? 'overdue'
                                  : 'active'
                              }`}
                            >
                              {editingIndex === todo.index ? (
                                <div className="edit-form">
                                  <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="input"
                                  />
                                  <div className="form-row">
                                    <input
                                      type="text"
                                      value={editForm.assignedTo}
                                      onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                                      className="input"
                                    />
                                    <input
                                      type="datetime-local"
                                      value={editForm.deadline}
                                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                      className="input"
                                    />
                                  </div>
                                  <div className="edit-actions">
                                    <button onClick={saveEdit} className="btn btn-success-sm">
                                      <Save className="icon-small" /> Save
                                    </button>
                                    <button onClick={cancelEdit} className="btn btn-secondary-sm">
                                      <X className="icon-small" /> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="todo-content">
                                    <div className="todo-main">
                                      <div className="todo-header">
                                        <input
                                          type="checkbox"
                                          checked={todo.completed}
                                          onChange={() => toggleComplete(todo)}
                                          className="checkbox"
                                        />
                                        <p className={`todo-description ${todo.completed ? 'completed-text' : ''}`}>
                                          {todo.description}
                                        </p>
                                      </div>
                                      <div className="todo-meta">
                                        <div className="meta-item">
                                          <User className="icon-small" />
                                          <span>{todo.assignedTo}</span>
                                        </div>
                                        <div className={`meta-item ${isOverdue(todo.deadline) && !todo.completed ? 'overdue-text' : ''}`}>
                                          <Calendar className="icon-small" />
                                          <span>
                                            {new Date(todo.deadline).toLocaleString()}
                                            {isOverdue(todo.deadline) && !todo.completed && ' (Overdue!)'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="todo-actions">
                                      <button
                                        onClick={() => startEdit(todo)}
                                        className="btn-icon btn-icon-blue"
                                        disabled={loading}
                                      >
                                        <Edit2 className="icon-small" />
                                      </button>
                                      <button
                                        onClick={() => removeTodo(todo.index)}
                                        className="btn-icon btn-icon-red"
                                        disabled={loading}
                                      >
                                        <Trash2 className="icon-small" />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Delete List */}
                      <div className="delete-list-section">
                        <button
                          onClick={deleteTodoList}
                          className="btn btn-danger"
                          disabled={loading}
                        >
                          Delete List
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <List className="icon-large" />
                      <p>Select or create a list to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoListApp;