const Sequelize = require("sequelize");

const config = require("../../../config/config");

const sequelize = new Sequelize(config.SQL.database, config.SQL.username, config.SQL.password, config.SQL);

module.exports = sequelize;
