const {MongoClient,ObjectID} = require('mongodb');
var obj = new ObjectID();
console.log(obj);

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

  // db.collection('Todos').insertOne({
  //
  //   text: 'Something to do',
  //   completed: false
  //
  // }, (err, result) => {
  //   if(err){
  //     return console.log('unable to insert todo');
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  db.collection('Users').insertOne({

    name: 'Jonathan',
    age: 26,
    location: 'Hamburg'

  }, (err, result) => {
    if(err){
      return console.log('unable to insert users');
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
    console.log(result.ops[0]._id.getTimestamp());
  });

  client.close();
});
