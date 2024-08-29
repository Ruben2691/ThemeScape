// all express imports
const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// this lets us determine what environment we're in so that we can do different process in that environment
const { environment } = require("./config");
const isProduction = environment === "production";

// used to connect to routes
const routes = require('./routes');

// this is to set up our express app
const app = express();

// this is to log info about req and res
app.use(morgan("dev"));

/**Add the cookie-parser middleware for parsing cookies and the express.json middleware for parsing JSON bodies of requests with Content-Type of "application/json". */
app.use(cookieParser());
app.use(express.json());

// Security Middleware
//this conditional checks if we're in a production environment
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);





app.use(routes); // Connect all the routes

// backend/app.js


module.exports = app;
