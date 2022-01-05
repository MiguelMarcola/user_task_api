const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(users => users.username === username);

  if(!user){
    return response.status(404).json({error: "Usuário não encontrado"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some(
    (users) => users.username === username
  );

  if(usersAlreadyExists){
    return response.status(400).json({error: "Username ja existe"});
  }

  const newUser = {
      id: uuidv4(),
      name: name, 
      username: username, 
      todos: []
    }


  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  addTasks = {
    id: uuidv4(), 
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }


  user.todos.push(addTasks)
  response.status(201).json(addTasks)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params
  const { title, deadline } = request.body;

  const userTaskId = user.todos.find(
    (user) => user.id === id
  );

  if(!userTaskId){
    return response.status(404).json({error: "Tarefa não encontrada"})
  }

  if(title){
    userTaskId.title = title;
  }
  if(deadline){
    userTaskId.deadline = new Date(deadline)
  }

  return response.status(201).json(userTaskId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTaskId = user.todos.find(
    (users) => users.id === id
  );

  if(!userTaskId){
    return response.status(404).json({error: "Id não encontrado"})
  }

  userTaskId.done = true;

  return response.status(201).json(userTaskId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTaskId = user.todos.find(
    (users) => users.id === id
  );

  if(!userTaskId){
    return response.status(404).json({error: "Id não encontrado"})
  }

  user.todos.splice(user.todos.indexOf(userTaskId), 1)

  return response.status(204).json(user.todos);
});

module.exports = app;