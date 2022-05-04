const config = {
  development: {
    SQL: {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PWD,
      database: process.env.DATABASE,
      host: process.env.DATABASE_HOST,
      dialect: "mysql",
    },
    NOSQL: "",
  },
  production: {
    SQL: {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PWD,
      database: process.env.DATABASE,
      host: process.env.DATABASE_HOST,
      dialect: "mysql",
    },
    NOSQL: "",
  },
};

const configData = process.env.NODE_ENV === "development " ? config.development : config.production;

module.exports = configData;
