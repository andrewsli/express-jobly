process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../../app");
const db = require("../../db");
const {SEED_DB_SQL} = require("../../config");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testAdminToken;



beforeEach(async () => {
  await db.query(`DELETE FROM companies;`);
  await db.query(`DELETE FROM users`);
  await db.query(SEED_DB_SQL);
  let testAdminResult = await db.query(`SELECT * FROM users WHERE username = 'user2'`)
  let testAdmin = testAdminResult.rows[0];
  testAdminToken = jwt.sign(testAdmin, SECRET_KEY);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /jobs", function () {

  test("searches all jobs with no params passed", async function () {
    let response = await request(app).get(`/jobs`).send({_token: testAdminToken});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      jobs:
        [{ title: 'Software Engineer', company_handle: 'FB' },
        { title: 'CEO', company_handle: 'G' },
        { title: 'Social Media Intern', company_handle: 'G' }]
    });
  });

  test("searches jobs with all parameters passed: search, min_salary, min_equity", async function () {
    let response = await request(app).get(`/jobs?search=ceo&min_salary=10000&min_equity=0.0001`).send({_token: testAdminToken});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ jobs: [{ title: 'CEO', company_handle: 'G' }] });
  });

  test("searches jobs with only min_salary passed", async function () {
    let response = await request(app).get(`/jobs?min_salary=100000`).send({_token: testAdminToken});
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      jobs:
        [{ title: 'Software Engineer', company_handle: 'FB' },
        { title: 'CEO', company_handle: 'G' }]
    });
  });

  test("searches jobs with only min_equity passed", async function () {
    let response = await request(app).get(`/jobs?min_equity=0.001`).send({_token: testAdminToken});
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ jobs: [{ title: 'CEO', company_handle: 'G' }] });
  });

  test("searches for a specific job", async function () {
    let response = await request(app).get(`/jobs/9999999`).send({_token: testAdminToken});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      job:
      {
        id: 9999999,
        title: 'Social Media Intern',
        salary: 65000,
        equity: 0,
        company_handle: 'G',
        date_posted: expect.any(String)
      }
    });
  });

  test("expect error message if searching for job that does not exist", async function () {
    let response = await request(app).get(`/jobs/1`).send({_token: testAdminToken});
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: "Job not found.", status: 400, });
  });
});


describe('POST /jobs', function () {

  test('creates a new job and enters it into db', async function () {
    let response = await request(app)
      .post('/jobs')
      .send({
        title: 'Janitor',
        salary: 50000,
        equity: 0,
        company_handle: 'G',
        _token: testAdminToken
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'Janitor',
        salary: 50000,
        equity: 0.0,
        company_handle: 'G',
        date_posted: expect.any(String)
      }
    });
    let jobs = await request(app).get('/jobs').send({_token: testAdminToken});
    expect(jobs.body.jobs.length).toEqual(4);
  });

  test('throws error if title and company_handle already exists', async function () {
    let response = await request(app)
      .post('/jobs')
      .send({
        title: "CEO",
        salary: 2500000,
        equity: .09,
        company_handle: "G",
        _token: testAdminToken,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: "Job already posted.", status: 400 });
  });

  test('throws list of errors if invalid inputs', async function () {
    let response = await request(app)
      .post('/jobs')
      .send({
        title: "assistant",
        salary: '1 million',
        equity: 'zero',
        company_handle: "G",
        _token: testAdminToken,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message:
        ['instance.salary is not of a type(s) integer',
          'instance.equity is not of a type(s) number']
    });
  });
});

describe('PATCH /jobs/:id', function () {

  test('updates a job', async function () {
    let response = await request(app)
      .patch('/jobs/9999999')
      .send({
        title: "Assistant",
        salary: 55000,
        equity: 0,
        _token: testAdminToken,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'Assistant',
        salary: 55000,
        equity: 0.0,
        company_handle: 'G',
        date_posted: expect.any(String)
      }
    });
  });

  test('throws error if trying to update job that does not exist', async function () {
    let response = await request(app)
      .patch('/jobs/1')
      .send({
        title: "Assistant",
        salary: 55000,
        equity: 0,
        _token: testAdminToken,
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Job not found.", status: 404 });
  });

  test('throws list of errors if invalid inputs', async function () {
    let response = await request(app)
      .patch('/jobs/9999999')
      .send({
        title: 5432,
        salary: "55000",
        equity: "1%",
        _token: testAdminToken,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message:
        ['instance.title is not of a type(s) string',
          'instance.salary is not of a type(s) integer',
          'instance.equity is not of a type(s) number']
    });
  });
});

describe('DELETE /jobs/:id', function () {

  test('delete a job', async function () {
    let response = await request(app).delete('/jobs/9999999').send({_token: testAdminToken});
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Job deleted" });
  });

  test('error message if job does not exist', async function () {
    let response = await request(app).delete('/jobs/1').send({_token: testAdminToken});
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Job not found.", status: 404 });
  })

});

describe('404 error handler', function () {

  test('reaches 404 requesting invalid page', async function () {
    let response = await request(app).post('/jobs/engineer').send({_token: testAdminToken});
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ status: 404, message: 'Not Found' });
  });

});
