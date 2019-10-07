# Jobly
A back-end for a job board built with Express.

For the front end built with React, visit [react-jobly](https://github.com/andrewsli/react-jobly)

# Build status
[![Build Status](https://travis-ci.com/cyhk/jobly.svg?branch=master)](https://travis-ci.com/cyhk/jobly.svg?branch=master)

# Tech/framework used
**Built with:**
- Express
- PostgreSQL

# How to use
Create database and tables:
```
createdb jobly
createdb jobly-test

psql jobly < seed.sql
psql jobly-test < seed.sql
```
Install all dependencies:
```
npm install
```

To run tests:
```
jest -i
```

# API

## Companies
**GET /companies**

Returns the handle and name for all matching companies along with associated jobs. If no query string parameters are supplied, the route returns all companies. The route supports the following query string parameters:
  
  - **search**: filters by handle or name
  - **min_employees**: filters for companies with more than or equal to min_employees
  - **max_employees**: filters fro companies with less than or equal to max_employees

Returns JSON `{company: {...companyData, jobs: [job, ...]}}`

**POST /companies**

Creates a company in the database. Returns JSON `{ company: companyData }`

**GET /companies/[handle]**

Returns company matching handle as JSON `{ company: companyData }`

**PATCH /companies/[handle]**

Update an existing company. Returns JSON `{ company: companyData }`

**DELETE /companies/[handle]**

Removes the company from the database. Returns JSON `{ message: "Company deleted" }` upon success.

## Jobs
***POST /jobs***

Creates a new job and returns JSON `{ job: jobData }`

***GET /jobs***

List all matching jobs ordered by most recently posted. If no query string parameters are supplied, the route returns all jobs.

The following query string parameters are supported:
- **search**: filters by title and company handle
- **min_salary**: filters for jobs paying more than a specified minimum salary
- **min_equity**: filters for jobs with more than a specified minimum equity

Returns JSON `{ jobs: [job, ...] }`

***GET /jobs/[id]***

Returns job with the specified `id` as JSON `{ job: jobData }`

***PATCH /jobs/[id]***

Updates a job matching the `id`. Returns JSON `{job: jobData}`

***DELETE /jobs/[id]***

Deletes the job with `id` from database. Returns JSON `{ message: "Job deleted" }`

## Users
***POST /users***

Creates a new user and returns JSON `{token: token}`

***GET /users***

Gets list of users. Returns users with username, first_name, last_name and email in JSON `{ users: [{username, first_name, last_name, email}, ...] }`

***GET /users/[username]***

Returns user information for `username`. Returns JSON: `{ user: {username, first_name, last_name, email, photo_url} }`

***PATCH /users/[username]***

Updates user information for `username` and returns JSON `{ user: {username, first_name, last_name, email, photo_url} }`

***DELETE /users/[username]***

Removes user with `username`. Returns JSON `{ message: "User deleted" }` upon success

## Authorization
***POST /login***

Authenticates a user and returns a JSON Web Token which contains a payload with the username and is_admin values.

Returns JSON `{token: token}`