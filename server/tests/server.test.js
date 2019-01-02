const expect = require('expect');
const request = require('supertest');
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
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
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
          expect(todos.length).toBe(dummyTodos.length);
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
        expect(res.body.todos.length).toBe(dummyTodos.length);
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
        expect(res.body.todo.text).toBe(dummyTodos[0].text);
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
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if(err) return done(err);

        Todo.findById(hexID).then((todo) => {
          expect(todo).not.toBeTruthy();
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
      expect(res.body.todo.completed).toBeTruthy();
      expect(res.body.todo.text).toBe('updated text');
      expect(typeof res.body.todo.completedAt).toBe('number');
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
      expect(res.body.todo.completed).not.toBeTruthy();
      expect(res.body.todo.completedAt).not.toBeTruthy();
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
      expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
      expect(res.body.email).toBe(dummyUsers[0].email)
    })
    .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
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
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if(err){
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
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
