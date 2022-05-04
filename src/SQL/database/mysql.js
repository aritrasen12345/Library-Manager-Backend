/* eslint-disable no-console */
const Sequelize = require("sequelize");
const sequelize = require("./connection");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;

// models
db.User = require("../models/user");

db.User.hasOne(db.Designation, { foreignKey: "_id", sourceKey: "designationId", as: "designation" });

// checking connection to database
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

sequelize
  .sync()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = db;

// { force: true }
