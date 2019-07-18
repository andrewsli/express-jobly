const express = require("express");
const app = express();
const ExpressError = require("../helpers/expressError");
const router = express.Router();
const Job = require("../models/job");
const jsonschema = require('jsonschema');

const createJobSchema = require('../schemas/createJobSchema.json');
const updateJobSchema = require('../schemas/updateJobSchema.json');


app.use(express.json());

/** GET / - get list of jobs.
 *
 * => {jobs: [jobData, ...]}
 *
 * Can pass in optional parameters: search (str, searches by title), min_salary (int), min_equity (int)
 * 
 **/
router.get('/', async function (req, res, next) {
  try {
    let search = req.query.search;
    let min_salary = +req.query.min_salary || req.query.min_salary;
    let min_equity = +req.query.min_equity || req.query.min_equity;

    let jobs = await Job.search(search, min_salary, min_equity);
    return res.json({ jobs });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    return next(formattedError);
  }
});

/** POST / - post a new job
 *
 * {title, salary, equity, company_handle} => {job: jobData}
 *
 **/
router.post('/', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, createJobSchema);

    if(!result.valid){
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    
    let { title, salary, equity, company_handle } = req.body;
    let job = await Job.create(title, salary, equity, company_handle);

    return res.json({ job });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    return next(formattedError);
  }
});

/** GET /:id - get a job by id
 *
 * => {job: jobData}
 *
 **/
router.get('/:id', async function (req, res, next) {
  try {
    id = req.params.id;
    let job = await Job.get(id);
    return res.json({ job });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    return next(formattedError);
  }
});

/** PATCH /:id - update an existing job
 * 
 * {name, num_employees, description, logo_url} =>
 * {job: jobData}
 * 
 */
router.patch('/:id', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateJobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let items = req.body;
    let job = await Job.update(req.params.id, items);
    return res.json({ job });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 404);
    return next(formattedError);
  }
});

/**DELETE /:id - delete an existing job
 * 
 * => {message: "Job deleted"}
 * 
 */
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await Job.delete(req.params.id);
    return res.json(result);
  } catch (err) {
    let formattedError = new ExpressError(err.message, 404)
    return next(formattedError);
  }
});

module.exports = router;