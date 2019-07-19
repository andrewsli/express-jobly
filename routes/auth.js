const express = require("express");
const app = express();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


app.use(express.json());


/** POST /login -
 * 
 */
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;

    const result = await db.query(
      `SELECT password From users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if(user) {
      if (await bcrypt.compare(password, user.password) === true){
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
      }
    }

    throw new ExpressError("Invalid username/password", 400);

  } catch (err) {
    next(err);
  }
})

module.exports = router;