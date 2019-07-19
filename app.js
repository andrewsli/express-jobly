/** Express app for jobly. */
const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const app = express();
const { authenticateJWT } = require("./middleware/auth");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// add logging system
app.use(morgan("tiny"));

// get auth token for all routes
app.use(authenticateJWT);

// Routes
const companiesRoutes = require("./routes/companies");
const jobsRoutes = require("./routes/jobs");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

app.use("/companies", companiesRoutes);
app.use("/jobs", jobsRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
