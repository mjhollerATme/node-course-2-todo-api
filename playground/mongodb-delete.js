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

  //deleteMany
  // db.collection('Todos').deleteMany({ text: 'Dance the rain dance' }).then((result) => {
  //   console.log(result);
  // });
  //deleteOne
  // db.collection('Todos').deleteOne({ text: 'bla' }).then((result) => {
  //   console.log(result);
  // });
  //findOneAndDelete
  // db.collection('Todos').findOneAndDelete({ completed: false }).then((result) => {
  //   console.log(result);
  // });
  db.collection('Users').deleteMany({ name: 'Jonathan' }).then((result) => {
    console.log(result);
  });

  //client.close();
});
