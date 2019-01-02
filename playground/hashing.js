const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

var token = jwt.sign(data, 'somesecretstring-salt');
console.log(token);
var decoded = jwt.verify(token, 'somesecretstring-salt');
console.log(decoded);



// var message = 'I am user nr. 3';
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`hash: ${hash}`);


// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecretstring-salt').toString()
// };
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecretstring-salt').toString();
//
// if(resultHash === token.hash){
//   //data was not manipulated
//   console.log('data was not manipulated');
// }else{
//   console.log('data was changed. Do not trust');
// }
