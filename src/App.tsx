import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  async function createTodo() {
    if (task.trim()) {
      await client.models.Todo.create({
        content: `${task}: ${description}`,
      });
      setTask("");
      setDescription("");
    } else {
      alert("Task name is required.");
    }
  }

  function deleteTodo(id: string) {
    if (confirm("Are you sure you want to delete this todo?")) {
      client.models.Todo.delete({ id });
    }
  }

  // Handling Update Todo
  async function updateTodo() {
    if (task.trim()) {
      await client.models.Todo.update({
        id: editingTodoId!,
        content: `${task}: ${description}`,
      });
      setTask("");
      setDescription("");
      setEditingTodoId(null);  // Reset editing state
    } else {
      alert("Task name is required.");
    }
  }

  function startEditing(todo: Schema["Todo"]["type"]) {
    setEditingTodoId(todo.id);
    setTask(todo.content.split(":")[0]); // Split task and description
    setDescription(todo.content.split(":")[1] || "");
  }

  return (
    <main>
      <h1>My Todos</h1>

      <div className="todo-form">
        <input
          type="text"
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={editingTodoId ? updateTodo : createTodo}>
          {editingTodoId ? "Update Todo" : "Add Todo"}
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.content}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
            <button
              className="edit-btn"
              onClick={() => startEditing(todo)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
