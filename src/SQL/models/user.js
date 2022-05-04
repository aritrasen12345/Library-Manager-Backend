/* eslint-disable no-param-reassign */
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../database/connection");

const User = sequelize.define(
  "user",
  {
    _id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER(3),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    designationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { underscored: false }
);

User.beforeSave((user) => {
  if (user.changed("password")) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
  }
});

User.validPassword = async (password, userPassword) => {
  const isValid = await bcrypt.compare(password, userPassword);

  return isValid;
};

module.exports = User;
