const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((userFind) => userFind.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userNameAlredyExists = users.some((user) => user.username === username);

  if (userNameAlredyExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const user = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todoOperation);

  return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.some((todoFind) => todoFind.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not already exists!" });
  }

  const todoIndex = user.todos.findIndex((todoFind) => todoFind.id === id);

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(201).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.some((todoFind) => todoFind.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not already exists!" });
  }

  const todoIndex = user.todos.findIndex((todoFind) => todoFind.id === id);

  user.todos[todoIndex].done = true;

  return response.status(201).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find((todoFind) => todoFind.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not already exists!" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;