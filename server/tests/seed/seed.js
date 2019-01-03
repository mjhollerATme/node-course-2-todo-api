const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/users');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const dummyUsers = [{
  _id: userOneID,
  email: 'user1@mjholler.de',
  password: 'userOnePassword',
  tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneID, access: 'auth' }, 'abc123').toString()
    }]
},
{
  _id: userTwoID,
  email: 'user2@mjholler.de',
  password: 'userTwoPassword'
}];

const dummyTodos = [
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d3'),
    text: "Something todo",
    completed: false
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d4'),
    text: "Something else todo",
    completed: false,
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d5'),
    text: "Just another task",
    completed: true,
    completedAt: 333
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d6'),
    text: "A boring task to complete today"
  }
];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(dummyUsers[0]).save();
    var userTwo = new User(dummyUsers[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

const populateTodos = (done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(dummyTodos);
  }).then(() => done());
};

module.exports = {
  dummyTodos,
  dummyUsers,
  populateTodos,
  populateUsers
};
