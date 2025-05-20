import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");

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
        <button onClick={createTodo}>Add Todo</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.content}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
