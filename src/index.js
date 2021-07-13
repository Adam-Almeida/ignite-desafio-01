const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username );

    if(!user){
      return response.json({ error: "User not found!" });
    }

    request.user = user;
    return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyUserExistsUsername = users.some(
    (user) => user.username === username
  );

  if(alreadyUserExistsUsername){
    return response.status(400).json({ error: 'Username already exists!' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);

 });

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id );

  if(!todo){
    return response.status(404).json({ error: 'Todo not Found' });
  }

  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.send(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id );

  if(!todo){
    return response.status(404).json({ error: 'Todo not Found' });
  }

  todo.done = true;

  return response.send(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.findIndex((todo) => todo.id === id );

  if(todo === -1){
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();

});

module.exports = app;