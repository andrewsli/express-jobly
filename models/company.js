// Company class for jobly
const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

const MAX_COMPANY_SIZE = 80000000;
class Company {

  /** get companies
   * 
   * Accepts search term, min_employees, and max_employees 
   * returns [{handle: "FB", name: "Facebook"}, {handle: "G", name: "Google"}, ...]
   * 
   */
  static async search(search, min_employees = 0, max_employees = MAX_COMPANY_SIZE) {
    if (min_employees > max_employees) {
      throw new Error("Min employees must be less than max employees.");
    }

    if (!search) {
      var companies = await db.query(
        `SELECT handle, name
        FROM companies
        WHERE num_employees >= $1 AND num_employees <= $2;`,
        [min_employees, max_employees]
      );
    } else {
      var companies = await db.query(
        `SELECT handle, name
        FROM companies
        WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3;`,
        [`%${search}%`, min_employees, max_employees]
      );
    }

    if (companies.rowCount === 0) {
      throw new Error(`No companies found.`)
    };

    return companies.rows;
  }

  /** create a company
   * 
   * (handle, name, num_employees, description, logo) { companyData }
   * 
   */
  static async create(handle, name, num_employees, description, logo) {
    try {
      let company = await db.query(
        `INSERT INTO companies
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
        [handle, name, num_employees, description, logo]
      )
      return company.rows[0];
    } catch (err) {
      throw new Error("Company handle/name already exists");
    }
  }

  /** get a company by handle
   * 
   * handle => { companyData }
   */
  static async get(handle) {
    
    let company = await db.query(
      `SELECT *
      FROM companies
      WHERE handle=$1`,
      [handle]
    );

    if (company.rowCount === 0) {
      throw new Error(`Company not found.`);
    }

    return company.rows[0];
  }

  /** update a company by handle
   * 
   * (handle, {name, num_employees, description, logo_url}) =>
   * {company: companyData}
   * 
   */
  static async update(handle, items) {
    let sqlQuery = sqlForPartialUpdate('companies', items, 'handle', handle);
    let company = await db.query(sqlQuery.query, sqlQuery.values);

    if(company.rowCount===0){
      throw new Error(`Company not found.`);
    }

    return company.rows[0];
  }

  /** delete a company by handle
   * 
   * => {message: "Company deleted"}
   * 
   */
  static async delete(handle){
    let result = await db.query(
      `DELETE FROM companies
      WHERE handle = $1
      RETURNING *`,
      [handle]
    );
    
    if (result.rowCount === 0){
      throw new Error("Company not found.");
    }

    return {message: "Company deleted"}
  }
}

module.exports = Company;