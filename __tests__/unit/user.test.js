process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const {
  SEED_DB_SQL
} = require("../../config");
const db = require("../../db");
const User = require("../../models/user");


describe("User model", function () {

  beforeEach(async () => {
    await db.query(`DELETE FROM users;`);
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM jobs;`);
    await db.query(SEED_DB_SQL);
  });

  afterEach(async () => {
    await db.query(`DELETE FROM users`);
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM jobs;`);
  });

  afterAll(async () => {
    await db.end();
  });

  describe("User.create", function () {

    test("creates a user", async function () {
      let users = await db.query(`
      select * from users;`);
      let response = await User.create("taco", "testpass", "taco", "burrito", "taco@burrito.com", "taco.jpg");
      expect(response).toEqual({
        username: "taco",
        first_name: "taco",
        last_name: "burrito",
        email: 'taco@burrito.com',
        photo_url: "taco.jpg"
      });
    });

    test("throws error if username already exists", async function () {
      try {
        await User.create("testuser", "testpass", "taco", "burrito", "taco@burrito.com", "taco.jpg");
      } catch (err) {
        expect(err.message).toEqual("Username already taken.");
      }
    });

  });


  describe("User.getAll", function () {

    test("gets all users", async function () {
      let response = await User.getAll();

      expect(response).toEqual([{
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
      ]);
    });
    // returns an empty array if there are no users
  });


  describe("User.get", function () {

    test("gets a user", async function () {
      let response = await User.get('testy');

      expect(response).toEqual({
        username: 'testy',
        first_name: 'test',
        last_name: 'user',
        email: 'mctest@gmail.com',
        photo_url: 'testuser.jpg'
      });
    });

    test("throws error if user does not exist", async function () {
      try {
        await User.get('notrealuser');
      } catch (err) {
        expect(err.message).toEqual("User not found.");
      }
    });
  });


  describe("User.update", function () {

    test("updates a user", async function () {
      let response = await User.update('testy', {
        last_name: 'mctest'
      });

      expect(response).toEqual({
        username: 'testy',
        password: 'password',
        first_name: 'test',
        last_name: 'mctest',
        email: 'mctest@gmail.com',
        photo_url: 'testuser.jpg',
        is_admin: false
      });
    });

    test("throws error if trying to update username to something that already exists", async function() {
      try {
        await User.update('user2', {
          username: 'testy'
        });
      } catch (err) {
        expect(err.message).toEqual("Username already exists.");
      }
    })

    test("throws error if user does not exist", async function () {
      try {
        await User.update('notrealuser', {
          first_name: 'burrito'
        });
      } catch (err) {
        expect(err.message).toEqual("User not found.");
      }
    });
  });


  describe("User.delete", function () {

    test("deletes a user", async function () {
      let response = await User.delete("testy");
      expect(response).toEqual({
        message: 'User deleted'
      });
    });

    test("throws error if user does not exist", async function () {
      try {
        await User.delete("notrealuser");
      } catch (err) {
        expect(err.message).toEqual("User not found.");
      }
    });
  })

});






;