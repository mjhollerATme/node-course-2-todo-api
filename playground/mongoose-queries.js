const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = '5c28f106d777e44a5200b3d23';

if( !ObjectID.isValid(id) ){
  console.log('ID not valid');
}

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// }).catch(e => console.log(e));
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   if(!todo) return console.log('ID not found');
//   console.log('Todo', todo);
// }).catch(e => console.log(e));

// Todo.findById(id).then((todo) => {
//   if(!todo) return console.log('ID not found');
//   console.log('Todo By ID', todo);
// }).catch(e => console.log(e));
