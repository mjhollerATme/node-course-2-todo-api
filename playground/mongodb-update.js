const {MongoClient,ObjectID} = require('mongodb');
var obj = new ObjectID();


const url = 'mongodb://localhost:27017';
const dbName = 'TodoApp';
const client = new MongoClient(url);


var user = {name:'Jonathan', age:26};
var {name} = user;
console.log(name);

client.connect( (err, client) => {
  if(err){
    return console.log('unable to connect to MongoDB Server');
  }
  console.log('Connected to MongoDB Server TodoApp Database');
  const db = client.db( dbName );

  db.collection('Todos').findOneAndUpdate({
    _id: new ObjectID('5c277efb8f7183d02c805e5f')
  },
  {
    $set: {
      completed: true
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5c27766fa492b33d0af189d6')
  },
  {
    $set: {
      name: 'Jonathan'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  //client.close();
});
