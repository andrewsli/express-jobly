process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const { SEED_DB_SQL } = require("../../config");
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
        console.log('ERRORRRR', err)
        expect(err.message).toEqual("Username already taken.");
      }
    });

  });
});

// describe("Job.get", function () {

//   test("gets a job", async function () {
//     let response = await Job.get(9999999);

//     expect(response).toEqual({
//       id: 9999999,
//       title: 'Social Media Intern',
//       salary: 65000.00,
//       equity: 0,
//       company_handle: 'G',
//       date_posted: expect.any(Date)
//     });
//   });

//   test("throws error if job does not exist", async function () {
//     try {
//       await Job.get(1);
//     } catch (err) {
//       expect(err.message).toEqual("Job not found.");
//     }
//   });

// });

// describe("Job.update", function () {

//   test("updates a job", async function () {
//     let response = await Job.update(9999999, { salary: 70000 });

//     expect(response).toEqual({
//       id: 9999999,
//       title: 'Social Media Intern',
//       salary: 70000.00,
//       equity: 0,
//       company_handle: 'G',
//       date_posted: expect.any(Date)
//     });
//   });

//   test("throws error if job does not exist", async function () {
//     try {
//       await Job.update(1, { salary: 70000 });
//     } catch (err) {
//       expect(err.message).toEqual("Job not found.");
//     }
//   });
// });

// describe("Job.delete", function () {

//   test("deletes a job", async function () {
//     let response = await Job.delete(9999999);
//     expect(response).toEqual({ message: 'Job deleted' });
//   });

//   test("throws error if job does not exist", async function () {
//     try {
//       await Job.delete(1);
//     } catch (err) {
//       expect(err.message).toEqual("Job not found.");
//     }
//   });
// });
