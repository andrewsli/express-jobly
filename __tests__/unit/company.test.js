process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

describe("Company model", function () {

  beforeEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(
      `INSERT INTO companies
      VALUES (
          'FB',
          'Facebook',
          35000,
          'Social media giant',
          'https://image.flaticon.com/icons/png/512/124/124010.png'
      );
      
      INSERT INTO companies
      VALUES (
          'G',
          'Google',
          72000,
          'Lord Google',
          'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
      );`)
  })

  afterEach(async () => {
    await db.query(`DELETE FROM companies`);
  });

  afterAll(async () => {
    await db.end();
  });

  describe("Company.search", function () {

    test("searches all companies with no params passed", function () {
      let response = Company.search();
      expect(response).resolves.toEqual([{ "handle": "FB", "name": "Facebook" }, { "handle": "G", "name": "Google" }]);
    });

    test("searches companies based on parameters passed: search, min_employees, max_employees", function () {
      let response = Company.search("face", 10000, 50000);

      expect(response).resolves.toEqual([{ "handle": "FB", "name": "Facebook" }]);
    });

    test("throws error if min_employees > max_employees", function () {
      let response = Company.search("face", 10000, 9000);
      expect(response).rejects.toThrowError(new Error("Min employees must be less than max employees."));
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

    test("throws error if company does not exist", async function () {
      let response = Company.update('fake', { description: "Fined $5 billion" } );

      expect(response).rejects.toThrowError(new Error("Company not found."));
    });
  });

  describe("Company.delete", function() {

    test("deletes a company", async function() {
      let response = await Company.delete('FB');
      expect(response).toEqual({ message: 'Company deleted' });
    });

    test("throws error if company not found", function() {
      let response = Company.delete('fake');

      expect(response).rejects.toThrowError(new Error("Company not found."));
    });
  });
});
