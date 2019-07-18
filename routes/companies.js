const express = require("express");
const app = express();
const ExpressError = require("../helpers/expressError");
const router = express.Router();
const Company = require("../models/company");
const jsonschema = require('jsonschema');
const createCompanySchema = require('../schemas/createCompanySchema.json');
const updateCompanySchema = require('../schemas/updateCompanySchema.json');


app.use(express.json());

/** GET / - get list of companies.
 *
 * => {companies: [companyData, ...]}
 *
 * Can pass in optional parameters: search (str), min_employees (int), max_employees (int)
 **/
router.get('/', async function (req, res, next) {
  try {
    let search = req.query.search;
    let min_employees = +req.query.min_employees || req.query.min_employees;
    let max_employees = +req.query.max_employees || req.query.max_employees;

    let companies = await Company.search(search, min_employees, max_employees);
    return res.json({ companies });
  } catch (err) {
    let formattedError = new ExpressError(err.message,400);
    next(formattedError);
  }
});

/** POST / - post a new company
 *
 * {handle, name, num_employees, description, logo}=> {company: companyData}
 *
 **/
router.post('/', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, createCompanySchema);

    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    
    let { handle, name, num_employees, description, logo } = req.body;
    let company = await Company.create(handle, name, num_employees, description, logo);

    return res.json({ company });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    next(formattedError);
  }
});

/** GET /:handle - get a company by handle
 *
 * => {company: companyData}
 *
 **/
router.get('/:handle', async function (req, res, next) {
  try {
    handle = req.params.handle;
    let company = await Company.get(handle);
    return res.json({ company });
  } catch (err) {
    let formattedError = new ExpressError(err.message,400);
    next(formattedError);
  }
});

/** PATCH /:handle - update an existing company
 * 
 * {name, num_employees, description, logo_url} =>
 * {company: companyData}
 * 
 */
router.patch('/:handle', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateCompanySchema);

    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let items = req.body;
    let company = await Company.update(req.params.handle, items);
    return res.json({ company });
  } catch (err) {
    let formattedError = new ExpressError(err.message,404);
    next(formattedError);
  }
});

/**DELETE /:handle - delete an existing company
 * 
 * => {message: "Company deleted"}
 * 
 */
router.delete('/:handle', async function (req, res, next) {
  try {
    let result = await Company.delete(req.params.handle);
    return res.json(result);
  } catch (err) {
    let formattedError = new ExpressError(err.message, 404)
    next(formattedError);
  }
});

module.exports = router;