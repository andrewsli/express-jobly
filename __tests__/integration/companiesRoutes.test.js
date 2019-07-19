process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../../app");
const db = require("../../db");
const {SEED_DB_SQL} = require("../../config");

beforeEach(async () => {
  await db.query(`DELETE FROM companies;`);
  await db.query(SEED_DB_SQL);
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", function () {

  test("searches all companies with no params passed", async function () {
    let response = await request(app).get(`/companies`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies:
        [{ "handle": "FB", "name": "Facebook" },
        { "handle": "G", "name": "Google" }]
    });
  });

  test("searches companies with all parameters passed: search, min_employees, max_employees", async function () {
    let response = await request(app).get(`/companies?search=face&min_employees=10000&max_employees=50000`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies:
        [{
          "handle": "FB",
          "name": "Facebook"
        }]
    });
  });

  test("searches companies with only min_employees passed", async function () {
    let response = await request(app).get(`/companies?min_employees=10000`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies:
        [{
          "handle": "FB",
          "name": "Facebook"
        },
        {
          "handle": "G",
          "name": "Google"
        }]
    });
  });

  test("searches companies with only max_employees passed", async function () {
    let response = await request(app).get(`/companies?max_employees=50000`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies:
        [{
          "handle": "FB",
          "name": "Facebook"
        }]
    });
  });

  test("throws error if min_employees > max_employees", async function () {
    let response = await request(app).get(`/companies?search=face&min_employees=10000&max_employees=9000`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message: "Min employees must be less than max employees."
    });
  });

  test("searches for a specific company", async function () {
    let response = await request(app).get(`/companies/FB`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      "company": {
        "handle": "FB",
        "name": "Facebook",
        "num_employees": 35000,
        "description": "Social media giant",
        "logo_url": "https://image.flaticon.com/icons/png/512/124/124010.png"
      },
      "jobs": [
        {
          "id": expect.any(Number),
          "title": "Software Engineer",
          "salary": 150000,
          "equity": 0.000001,
          "company_handle": "FB",
          "date_posted": "2019-07-18T07:00:00.000Z"
        }
      ]
    });
  });

  test("throws error if searching for company that does not exist", async function () {
    let response = await request(app).get(`/companies/fakecompany`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: "Company not found.", status: 400, });
  });
});


describe('POST /companies', function () {

  test('creates a new company and enters it into db', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        handle: "twitch",
        name: "Twitch",
        num_employees: 1234,
        description: "Streaming platform for gamers"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: "twitch",
        name: "Twitch",
        num_employees: 1234,
        description: "Streaming platform for gamers",
        logo_url: null
      }
    });
    let companies = await request(app).get('/companies');
    expect(companies.body.companies.length).toEqual(3);
  });

  test('throws error if handle/name already exists', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        handle: "FB",
        name: "Facebook",
        num_employees: 1234,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: "Company handle/name already exists", status: 400 });
  });

  test('throws list of errors if invalid inputs', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        handle: "twitch",
        num_employees: '1234',
        description: 1
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message:
        ['instance requires property "name"',
          'instance.num_employees is not of a type(s) integer',
          'instance.description is not of a type(s) string']
    });
  });
});

describe('PATCH /companies/:handle', function () {

  test('updates a company', async function () {
    let response = await request(app)
      .patch('/companies/FB')
      .send({
        num_employees: 40000,
        description: 'Fined $5 billion'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: "FB",
        name: "Facebook",
        num_employees: 40000,
        description: "Fined $5 billion",
        logo_url: "https://image.flaticon.com/icons/png/512/124/124010.png"
      }
    });
  });

  test('throws error if trying to update company that does not exist', async function () {
    let response = await request(app)
      .patch('/companies/fakeCompany')
      .send({
        num_employees: 40000,
        description: 'Fined $5 billion'
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Company not found.", status: 404 });
  });

  test('throws list of errors if invalid inputs', async function () {
    let response = await request(app)
      .patch('/companies/FB')
      .send({
        num_employees: '1234',
        description: 1
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message:
        ['instance.num_employees is not of a type(s) integer',
          'instance.description is not of a type(s) string']
    });
  });
});

describe('DELETE /companies/:handle', function () {

  test('delete a company', async function () {
    let response = await request(app).delete('/companies/FB');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Company deleted" });
  });

  test('error message if company does not exist', async function () {
    let response = await request(app).delete('/companies/faker');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Company not found.", status: 404 });
  })

});

describe('404 error handler', function () {

  test('reaches 404 requesting invalid page', async function () {
    let response = await request(app).post('/companies/FB');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ status: 404, message: 'Not Found' });
  });

});