// User class for jobly
const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require("../config");

class User {

  /** create a user
   * 
   * (username, password, first_name, last_name, email, photo_url) => {user: user}
   * 
   */
  static async create(username, password, first_name, last_name, email, photo_url) {
    //Check that username isn't already taken
    let usernameExists = await db.query(
      `SELECT * FROM users
      WHERE username = $1`,
      [username]
    );
    if (usernameExists.rows[0]) {
      throw new Error("Username or email taken.");
    }

    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    let newUser = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING username, first_name, last_name, email, photo_url;`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );
    return newUser.rows[0];
  }

  /** get users 
   * 
   * => [{username, first_name, last_name, email}, ...]
   * 
   */
  static async getAll() {
    let users = await db.query(`SELECT username, first_name, last_name, email FROM users;`);
    return users.rows;
  }

  /** get user by username 
   * 
   * username => {username, first_name, last_name, email, photo_url}
   * 
   */
  static async get(username) {
    let user = await db.query(
      `SELECT username, first_name, last_name, email, photo_url 
      FROM users
      WHERE username = $1;`,
      [username]
      );

    if (user.rows.length === 0) {
      return [];
    }

    return user.rows[0];
  }


  /** update a user by usernam
   * 
   * (username, {username, first_name, last_name, email, photo_url}) =>
   * {username, first_name, last_name, email, photo_url}
   * 
   */
  static async update(username, items) {
    let sqlQuery = sqlForPartialUpdate('users', items, 'username', username);
    let user = await db.query(sqlQuery.query, sqlQuery.values);

    if (user.rowCount === 0) {
      throw new Error(`Job not found.`);
    }

    return user.rows[0];
  }


  /** delete a user by username
   * 
   * => {message: "User deleted"}
   * 
   */
  static async delete(username) {
    let result = await db.query(
      `DELETE FROM user
      WHERE username = $1
      RETURNING *`,
      [username]
    );

    if (result.rowCount === 0) {
      throw new Error("User not found.");
    }

    return { message: "User deleted" }
  }
}

module.exports = User;