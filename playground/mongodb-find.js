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

  // db.collection('Todos').find({
  //   _id: new ObjectID('5c277efb8f7183d02c805e5f')
  // })
  // .toArray()
  // .then((docs) => {
  //   console.log("Todos");
  //   console.log(JSON.stringify(docs, undefined, 2));
  //
  // }, (err) => {
  //   console.log("Unable to find todos", err);
  // });

  db.collection('Todos')
  .find()
  .count()
  .then((count) => {
    console.log(`Todos count: ${count}`);
  }, (err) => {
    console.log("Unable to find todos", err);
  });

  db.collection('Users')
  .find({ name: 'Jonathan' })
  .toArray()
  .then((docs) => {
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log("Unable to find User", err);
  });

  //client.close();
});
