
const request = require('supertest');
const {expect} = require('chai');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/users');
const {dummyTodos,populateTodos,dummyUsers, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST / todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).to.equal(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).to.equal(1);
          expect(todos[0].text).to.equal(text);
          done();
        }).catch((e) => done(e) );

      });
  });

  it('should not create todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end( (err, res) => {

        if(err){
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).to.equal(dummyTodos.length);
          done();
        }).catch( (e) => done(e) );

      });

  });

});

describe('GET /todos route', () => {

  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).to.equal(dummyTodos.length);
      })
      .end(done);
  });

});

describe('GET /todos/:id route', () => {

  it('should return todo by valid id', (done) => {
    request(app)
      .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.equal(dummyTodos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {

    var hexID = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexID}`)
      .expect(404)
      .end(done);

  });

  it('should return 400 if todo id invalid', (done) => {

    request(app)
      .get(`/todos/123`)
      .expect(400)
      .end(done);

  });

});

describe('DELETE /todos/:id route', () => {

  it('should remove a todo', (done) => {
    var hexID = dummyTodos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).to.equal(hexID);
      })
      .end((err, res) => {
        if(err) return done(err);

        Todo.findById(hexID).then((todo) => {
          expect(todo).not.to.exist;
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {

    var hexID = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(404)
      .end(done);

  });

  it('should return 400 if todo id invalid', (done) => {

    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);

  });

});


describe('PATCH /todos/:id', () => {

  it('should update the todo and set completedAt param', (done) => {

    var hexID = dummyTodos[3]._id.toHexString();
    request(app)
    .patch(`/todos/${hexID}`)
    .send({completed: true, text: 'updated text'})
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.completed).to.be.true;
      expect(res.body.todo.text).to.equal('updated text');
      expect(res.body.todo.completedAt).to.be.a('number');
    })
    .end(done);
  });

  it('should update the todo and unset completedAt param', (done) => {
    var hexID = dummyTodos[2]._id.toHexString();
    request(app)
    .patch(`/todos/${hexID}`)
    .send({ completed: false })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.completed).not.to.be.true;
      expect(res.body.todo.completedAt).not.to.be.true;
    })
    .end(done);
  });

});



describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', dummyUsers[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).to.equal(dummyUsers[0]._id.toHexString());
      expect(res.body.email).to.equal(dummyUsers[0].email)
    })
    .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });

});

describe('POST /users', () => {

  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '321test';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.be.a('string');
        expect(res.body._id).to.exist;
        expect(res.body.email).to.equal(email);
      })
      .end((err) => {
        if(err){
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).to.exist;
          expect(user.password).not.to.equal(password);
          done();
        });
      });
  });
  it('should return validation errors if request invalid', (done) => {
    var email = '@exampleexample.com';
    var password = '321';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });
  it('should not create user if email already used', (done) => {
    var email = dummyUsers[0].email;
    var password = '321test';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });

});

describe('POST /users/login', () => {

  it('should login user and return auth token', (done) => {

    request(app)
      .post('/users/login')
      .send({ email: dummyUsers[1].email, password: dummyUsers[1].password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.be.a('string');
      })
      .end((err, res) => {
        if(err) return done(err);

        User.findById(dummyUsers[1]._id).then((user) => {
          expect(user.tokens[0]).to.include({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch(e => done(e));
      });

  });
  it('should reject invalid login', (done) => {
    var email = 'someinvalid@email.de';
    var password = 'someinvalidpassword';
    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(401)
      .expect((res) => {
        expect(res.headers['x-auth']).to.not.exist;
      })
      .end((err, res) => {
        if(err) return done(err);

        User.findById(dummyUsers[1]._id).then((user) => {
          expect(user.tokens[0]).not.to.be.true;
          done();
        }).catch(e => done(e));
      });

  });

});
