/* eslint-disable no-unused-vars */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// env
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const errorMiddleware = require("./src/middleware/error");

global.__basedir = __dirname;

// database connection
require("./src/SQL/database/mysql");

const app = express();

const {
  apiUser,
} = require("./src/v1/routes/api");

app.use(helmet());
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, _path, stat) {
      res.set("x-timestamp", Date.now().toString());
    },
  })
);
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use("/v1/api/user", apiUser);


app.use(errorMiddleware);

app.use((req, res, next) => {
  res.json({
    status: false,
    message: "Invalid Api.",
  });
});

module.exports = app;
