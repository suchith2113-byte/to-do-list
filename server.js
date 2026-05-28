/*const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database helper functions
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading database file:', error);
    return [];
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// API Endpoints

// 1. Get all to-dos
app.get('/api/todos', (req, res) => {
  const todos = readDatabase();
  res.json(todos);
});

// 2. Create a new to-do
app.post('/api/todos', (req, res) => {
  const { title, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  const todos = readDatabase();
  const newTodo = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    title: title.trim(),
    category: (category && category.trim()) || 'General',
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  writeDatabase(todos);

  res.status(201).json(newTodo);
});

// 3. Update an existing to-do
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, category, completed } = req.body;

  const todos = readDatabase();
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'To-do item not found.' });
  }

  const todo = todos[todoIndex];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    todo.title = title.trim();
  }

  if (category !== undefined) {
    todo.category = typeof category === 'string' && category.trim() !== '' ? category.trim() : 'General';
  }

  if (completed !== undefined) {
    todo.completed = !!completed;
  }

  todos[todoIndex] = todo;
  writeDatabase(todos);

  res.json(todo);
});

// 4. Delete a to-do
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todos = readDatabase();
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'To-do item not found.' });
  }

  todos.splice(todoIndex, 1);
  writeDatabase(todos);

  res.status(204).end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
*/