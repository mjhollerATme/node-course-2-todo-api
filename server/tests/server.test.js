const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const dummyTodos = [
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d3'),
    text: "Something todo"
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d4'),
    text: "Something else todo"
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d5'),
    text: "Just another task"
  },
  {
    _id: new ObjectID('5c28f106d777e44a5200b3d6'),
    text: "A boring task to complete today"
  }
];

beforeEach((done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(dummyTodos);
  }).then(() => done());
});

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
