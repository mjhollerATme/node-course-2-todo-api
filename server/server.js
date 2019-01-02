require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/users');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {

  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });

});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(400).send('');
  }
  Todo.findById(id).then((todo) => {
    if(!todo){
      return res.status(404).send('');
    }
    res.status(200).send({todo});
  }).catch((e) => {
    res.status(400).send('');
  });
});


app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send('');
  }
  Todo.findByIdAndDelete(id).then((todo) => {
    if(!todo){
      return res.status(404).send('');
    }
    res.status(200).send({todo, deleted: "deleted"});
  }).catch((e) => {
    res.status(400).send('');
  });
});

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(400).send();
  }
  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => { res.status(400).send(); });
});

app.post('/users', (req, res) => {

  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken(); // saving user with token and return token for promise chaining
  }).then(token => {
    // send saved token back to user via custom header
    res.header('x-auth', token).send(user); // x- prefix used for custom header value
    // the user object is being send by express with json.stringify which uses toJSON which we modified in user.js to only include certain fields
  }).catch( (e) => {
    res.status(400).send(e);
  });

})

app.listen(port, () => {
  console.log(`Started on Port ${port}`);
});

module.exports = {app};
