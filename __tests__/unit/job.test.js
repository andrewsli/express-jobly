process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const {SEED_DB_SQL} = require("../../config");
const db = require("../../db");
const Job = require("../../models/job");

describe("Job model", function () {

  beforeEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(SEED_DB_SQL);
  });

  afterEach(async () => {
    await db.query(`DELETE FROM companies`);
  });

  afterAll(async () => {
    await db.end();
  });

  describe("job.search", function () {

    test("searches all jobs with no params passed", async function () {
      let response = await Job.search();
      expect(response).toEqual([
        { "title": "Software Engineer", "company_handle": "FB" },
        { "title": "CEO", "company_handle": "G" },
        { "title": "Social Media Intern", "company_handle": "G" }
      ]);
    });

    test("searches jobs with all parameters passed: search, min_salary, min_equity", async function () {
      let response = await Job.search("CEO", 60000, 0.01);

      expect(response).toEqual([{ "title": "CEO", "company_handle": "G" }]);
    });

    test("searches jobs with only min_salary", async function () {
      let response = await Job.search('', 80000);

      expect(response).toEqual([{ "title": "Software Engineer", "company_handle": "FB" }, { "title": "CEO", "company_handle": "G" }]);
    });

    test("searches jobs with only min_equity", async function () {
      let response = await Job.search('', 0, 0.01);
      
      expect(response).toEqual([{ "title": "CEO", "company_handle": "G" }]);
    });

    test("no jobs found", async function () {
      try {
        await Job.search("engineer", 200000, 0.05);
      } catch(err) {
        expect(err.message).toEqual("Job not found.");
      }
    });


    describe("Job.create", function () {

      test("creates a job", async function () {
        let response = await Job.create("Intern: Software Engineer", 72000, 0, "G");
        expect(response).toEqual({
          id: expect.any(Number),
          title: 'Intern: Software Engineer',
          salary: 72000,
          equity: 0,
          company_handle: 'G',
          date_posted: expect.any(Date)
        });
      });

      test("throws error if title already exists for company_handle", async function () {
        try {
          await Job.create("CEO", 20, .99, "G");
        } catch (err) {
          expect(err.message).toEqual("Job already posted.");
        }
      });

    });
  });


  describe("Job.get", function () {

    test("gets a job", async function () {
      let response = await Job.get(9999999);

      expect(response).toEqual({
        id: 9999999,
        title: 'Social Media Intern',
        salary: 65000.00,
        equity: 0,
        company_handle: 'G',
        date_posted: expect.any(Date)
      });
    });

    test("throws error if job does not exist", async function () {
      try {
        await Job.get(1);
      } catch (err) {
        expect(err.message).toEqual("Job not found.");
      }
    });

  });

  describe("Job.update", function () {

    test("updates a job", async function () {
      let response = await Job.update(9999999, { salary: 70000 });

      expect(response).toEqual({
        id: 9999999,
        title: 'Social Media Intern',
        salary: 70000.00,
        equity: 0,
        company_handle: 'G',
        date_posted: expect.any(Date)
      });
    });

    test("throws error if job does not exist", async function () {
      try {
        await Job.update(1, { salary: 70000 });
      } catch (err) {
        expect(err.message).toEqual("Job not found.");
      }
    });
  });

  describe("Job.delete", function () {

    test("deletes a job", async function () {
      let response = await Job.delete(9999999);
      expect(response).toEqual({ message: 'Job deleted' });
    });

    test("throws error if job does not exist", async function () {
      try {
        await Job.delete(1);
      } catch (err) {
        expect(err.message).toEqual("Job not found.");
      }
    });
  });
});
