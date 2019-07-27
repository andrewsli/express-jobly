process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../../app");
const db = require("../../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");
const { SEED_DB_SQL } = require("../../config");

let testAdminToken;

describe("Users Routes", function () {
  beforeEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM users;`);
    await db.query(SEED_DB_SQL);
    let testAdminResult = await db.query(`SELECT * FROM users WHERE username = 'user2'`)
    let testAdmin = testAdminResult.rows[0];
    console.log("TEST ADMIN IS", testAdmin)
    testAdminToken = jwt.sign(testAdmin, SECRET_KEY);
  });

  afterEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM users`);
  });

  afterAll(async () => {
    await db.end();
  });


  describe("GET /users", function () {

    test("gets a list of all users", async function () {
      let response = await request(app).get(`/users`).send({ _token: testAdminToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        users: [{
          username: 'testy',
          first_name: 'test',
          last_name: 'user',
          email: 'mctest@gmail.com'
        },
        {
          username: 'user2',
          first_name: 'User',
          last_name: '2',
          email: 'user2@gmail.com'
        }
        ]
      });
    });
  });

  describe("GET /users/:username", function () {

    test("gets a specific user", async function () {
      let response = await request(app).get(`/users/testy`).send({ _token: testAdminToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        user: {
          username: 'testy',
          first_name: 'test',
          last_name: 'user',
          email: 'mctest@gmail.com',
          photo_url: 'testuser.jpg'
        }
      });
    });

    test("expect empty array if username does not exist", async function () {
      let response = await request(app).get(`/users/faker`).send({ _token: testAdminToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        user: []
      });
    });
  });


  describe('POST /users', function () {

    test('creates a new user and enters it into db', async function () {
      let response = await request(app)
        .post('/users')
        .send({
          username: "newUser",
          password: "worstpassword",
          first_name: "Andrew",
          last_name: "Li",
          email: "andrew@gmail.com",
          photo_url: "andrew.jpg",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        token: expect.any(String),
        user: {
          username: 'newUser',
          first_name: 'Andrew',
          last_name: 'Li',
          email: 'andrew@gmail.com',
          photo_url: 'andrew.jpg'
        }
      });

      let users = await request(app).get('/users').send({ _token: testAdminToken });

      expect(users.body.users.length).toEqual(3);
    });

    test('throws error if username or email already exists', async function () {
      let response = await request(app)
        .post('/users')
        .send({
          username: "testy",
          password: "worstpassword",
          first_name: "Andrew",
          last_name: "Li",
          email: "andrew@gmail.com",
          photo_url: "andrew.jpg",
          _token: testAdminToken,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: "Username or email taken.",
        status: 400
      });
    });

    test('throws list of errors if invalid inputs', async function () {
      let response = await request(app)
        .post('/users')
        .send({
          username: "newUser",
          password: "worstpassword",
          first_name: 123,
          last_name: "Li",
          email: 7652,
          photo_url: "andrew.jpg",
          _token: testAdminToken,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: 400,
        message: ['instance.first_name is not of a type(s) string',
          'instance.email is not of a type(s) string'
        ]
      });
    });
  });


  describe('PATCH /users/:username', function () {

    test('updates a user', async function () {
      let response = await request(app)
        .patch('/users/user2')
        .send({
          first_name: 'user2',
          last_name: 'Test',
          email: 'admin@gmail.com',
          _token: testAdminToken,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        username: 'user2',
        first_name: 'user2',
        last_name: 'Test',
        email: 'admin@gmail.com',
        photo_url: 'user.jpg'
      });
    });

    test('throws error if trying to update user that does not exist', async function () {
      let response = await request(app)
        .patch('/users/andrew')
        .send({
          first_name: 'Andrew',
          last_name: 'Li',
          email: 'andrew@gmail.com',
        });
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: "Unauthorized",
        status: 401
      });
    });

    test('throws list of errors if invalid inputs', async function () {
      let response = await request(app)
        .patch('/users/user2')
        .send({
          first_name: 'Testy',
          last_name: 123,
          email: 8979324,
          _token: testAdminToken,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: 400,
        message: ['instance.last_name is not of a type(s) string',
          'instance.email is not of a type(s) string'
        ]
      });
    });
  });


  describe('DELETE /users/:username', function () {

    test('delete a user', async function () {
      let response = await request(app).delete('/users/user2').send({ _token: testAdminToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: "User deleted"
      });
    });

    test('error message if user does not exist', async function () {
      let response = await request(app).delete('/users/notrealuser').send({ _token: testAdminToken });
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: "Unauthorized",
        status: 401
      });
    })

  });


  describe('404 error handler', function () {

    test('reaches 404 requesting invalid page', async function () {
      let response = await request(app).post('/users/notrealuser').send({ _token: testAdminToken });
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        status: 404,
        message: 'Not Found'
      });
    });

  });
});