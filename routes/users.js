const express = require("express");
const app = express();
const ExpressError = require("../helpers/expressError");
const router = express.Router();
const User = require("../models/user");
const jsonschema = require('jsonschema');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const db = require("../db");


const createUserSchema = require('../schemas/createUserSchema.json');
const updateUserSchema = require('../schemas/updateUserSchema.json');

app.use(express.json());

/** GET / - get list of users.
 *
 * => {users: {users: [{username, first_name, last_name, email}, ...]}}
 * 
 **/
router.get('/', async function (req, res, next) {
  let users = await User.getAll();
  return res.json({ users });
});

/** POST / - create a new user
 * {username, password, first_name, last_name, email, photo_url} => {user: user}
 *
 **/
router.post('/', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, createUserSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url
    } = req.body;

    let user = await User.create(username, password, first_name, last_name, email, photo_url);
    let token = jwt.sign({ username }, SECRET_KEY);

    return res.json({
      user,
      token
    });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    return next(formattedError);
  }
});

/** GET /:username - get a job by id
 *
 * => {user: userData}
 *
 **/
router.get('/:username', async function (req, res, next) {
  try {
    username = req.params.username;
    let user = await User.get(username);
    return res.json({
      user
    });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 400);
    return next(formattedError);
  }
});

/** PATCH /:username - update an existing user
 * 
 * {username, password, first_name, last_name, email, photo_url} => {user: user}
 * 
 */
router.patch('/:username', ensureCorrectUser, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateUserSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let items = req.body;
    let user = await User.update(req.params.username, items);

    return res.json({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      photo_url: user.photo_url
    });
  } catch (err) {
    let formattedError = new ExpressError(err.message, 404);
    return next(formattedError);
  }
});

/**DELETE /:username - delete an existing user
 * 
 * => {message: "User deleted"}
 * 
 */
router.delete('/:username', ensureCorrectUser, async function (req, res, next) {
  try {
    let result = await User.delete(req.params.username);
    return res.json(result);
  } catch (err) {
    let formattedError = new ExpressError(err.message, 404)
    return next(formattedError);
  }
});

module.exports = router;