/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "jobly-test";
} else {
  DB_URI = process.env.DATABASE_URL || "jobly";
}

const BCRYPT_WORK_FACTOR = 12;

const SEED_DB_SQL = `INSERT INTO companies
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
);

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES (
    'Software Engineer',
    150000.00,
    .000001,
    'FB'
);

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES (
    'CEO',
    15000000.00,
    .10,
    'G'
);

INSERT INTO jobs (id, title, salary, equity, company_handle)
VALUES (
    9999999,
    'Social Media Intern',
    65000.00,
    0,
    'G'
);

INSERT INTO users
VALUES (
    'testy',
    'password',
    'test',
    'user',
    'mctest@gmail.com',
    'testuser.jpg',
    'false'
);`;

module.exports = {
  BCRYPT_WORK_FACTOR,
  SEED_DB_SQL,
  SECRET_KEY,
  PORT,
  DB_URI
};
