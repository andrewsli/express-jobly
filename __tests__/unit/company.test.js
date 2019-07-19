process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const {SEED_DB_SQL} = require("../../config");

describe("Company model", function () {

  beforeEach(async () => {
    await db.query(`DELETE FROM users;`);
    await db.query(`DELETE FROM companies;`);
    await db.query(SEED_DB_SQL);
  })

  afterEach(async () => {
    await db.query(`DELETE FROM users;`);
    await db.query(`DELETE FROM companies;`);
  });

  afterAll(async () => {
    await db.end();
  });

  describe("Company.search", function () {

    test("searches all companies with no params passed", async function () {
      let response = await Company.search();
      expect(response).toEqual([{ "handle": "FB", "name": "Facebook" }, { "handle": "G", "name": "Google" }]);
    });

    test("searches companies with all parameters passed: search, min_employees, max_employees", async function () {
      let response = await Company.search("face", 10000, 50000);

      expect(response).toEqual([{ "handle": "FB", "name": "Facebook" }]);
    });

    test("searches companies with only min_employees", async function () {
      let response = await Company.search('', 10000);

      expect(response).toEqual([{ "handle": "FB", "name": "Facebook" }, { "handle": "G", "name": "Google" }]);
    });

    test("searches companies with only max_employees", async function () {
      let response = await Company.search('', 0, 35000);

      expect(response).toEqual([{ "handle": "FB", "name": "Facebook" }]);
    });

    test("throws error if min_employees > max_employees", function () {
      let response = Company.search("face", 10000, 9000);
      expect(response).rejects.toThrowError(new Error("Min employees must be less than max employees."));
    });

    test("throws error if company does not exist", function () {
      let response = Company.search("WARBLGARBL", 0, 9000);
      expect(response).rejects.toThrowError(new Error("No companies found."));
    });

  });

  describe("Company.create", function () {

    test("creates a company", async function () {
      let response = await Company.create("ThanosChat", "Snapchat", 1, "perfectly balanced, as all things should be")
      expect(response).toEqual({
        handle: 'ThanosChat',
        name: 'Snapchat',
        num_employees: 1,
        description: 'perfectly balanced, as all things should be',
        logo_url: null
      });
    });

    test("throws error if company already exists", function () {
      let response = Company.create("FB", "Facebook");
      expect(response).rejects.toThrowError(new Error("Company handle/name already exists"));
    });

  });

  describe("Company.get", function () {

    test("gets a company", async function () {
      let response = await Company.get('FB');

      expect(response).toEqual({
        handle: 'FB',
        name: 'Facebook',
        num_employees: 35000,
        description: 'Social media giant',
        logo_url: 'https://image.flaticon.com/icons/png/512/124/124010.png'
      });
    });

    test("throws error if company does not exist", function () {
      let response = Company.get('fake');

      expect(response).rejects.toThrowError(new Error("Company not found."));
    });

  });

  describe("Company.update", function () {

    test("updates a company", async function () {
      let response = await Company.update('FB', { description: "Fined $5 billion" });

      expect(response).toEqual({
        handle: 'FB',
        name: 'Facebook',
        num_employees: 35000,
        description: 'Fined $5 billion',
        logo_url: 'https://image.flaticon.com/icons/png/512/124/124010.png'
      });
    });

    test("throws error if company does not exist", function () {
      let response = Company.update('fake', { description: "Fined $5 billion" });

      expect(response).rejects.toThrowError(new Error("Company not found."));
    });
  });

  describe("Company.delete", function () {

    test("deletes a company", async function () {
      let response = await Company.delete('FB');
      expect(response).toEqual({ message: 'Company deleted' });
    });

    test("throws error if company not found", function () {
      let response = Company.delete('fake');

      expect(response).rejects.toThrowError(new Error("Company not found."));
    });
  });

  describe("Company.getJobs", function () {

    test("gets jobs for a company", async function () {
      let jobs = await Company.getJobs("FB");
      expect(jobs).toEqual([{
        id: expect.any(Number),
        title: 'Software Engineer',
        salary: 150000,
        equity: 0.000001,
        company_handle: 'FB',
        date_posted: expect.any(Date)
      }])
    })

    test("throws error if no jobs found", function () {
      let response = Company.getJobs("WeChat");
      expect(response).rejects.toThrowError(new Error("No jobs found."));
    });
  });

});
