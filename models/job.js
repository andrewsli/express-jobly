// Company class for jobly
const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {
  /** search jobs
   * 
   * Accepts search term, min_salary, and min_equity
   * returns {[job, ...]}
   * 
   */
  static async search(search, min_salary = 0, min_equity = 0) {

    if (!search) {
      var jobs = await db.query(
        `SELECT title, company_handle
        FROM jobs
        WHERE salary >= $1 AND equity >= $2;`,
        [min_salary, min_equity]
      );
    } else {
      var jobs = await db.query(
        `SELECT title, company_handle
        FROM jobs
        WHERE title ILIKE $1 AND salary >= $2 AND equity >= $3;`,
        [`%${search}%`, min_salary, min_equity]
      );
    }

    if (jobs.rowCount === 0) {
      throw new Error(`Job not found.`)
    };

    return jobs.rows;
  }

  /** create a job
   * 
   * (title, salary, equity, company_handle) => { jobData }
   * 
   */
  static async create(title, salary, equity, company_handle) {
    let jobExists = await db.query(
      `SELECT * FROM jobs
        WHERE title = $1 AND company_handle = $2`,
      [title, company_handle]
    );
    if (jobExists.rows[0]) {
      throw new Error("Job already posted.");
    }
    let job = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`,
      [title, salary, equity, company_handle]
    );
    return job.rows[0];

  }

  /** get a job by id
   * 
   * id => {jobData}
   * 
   */
  static async get(id) {

    let jobs = await db.query(
      `SELECT *
      FROM jobs
      WHERE id=$1`,
      [id]
    );

    if (jobs.rowCount === 0) {
      throw new Error(`Job not found.`);
    }

    return jobs.rows[0];
  }


  /** update a job by id
   * 
   * (id, {title, salary, equity, company_handle}) =>
   * {jobData}
   * 
   */
  static async update(id, items) {
    let sqlQuery = sqlForPartialUpdate('jobs', items, 'id', id);
    let job = await db.query(sqlQuery.query, sqlQuery.values);

    if (job.rowCount === 0) {
      throw new Error(`Job not found.`);
    }

    return job.rows[0];
  }


  /** delete a job by id
   * 
   * => {message: "Job deleted"}
   * 
   */
  static async delete(id) {
    let result = await db.query(
      `DELETE FROM jobs
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("Job not found.");
    }

    return { message: "Job deleted" }
  }

}


module.exports = Job;