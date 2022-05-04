const express = require("express");
const db = require("../../../SQL/database/mysql");

const router = express.Router();
const checkAuth = require("../../../middleware/checkAuth");

/** Pagination Middleware */
const pagination = require("../../../middleware/pagination");

/** Validator */
const v = require("../../validators/validator");

/** Controller */
const userController = require("../../controller/userController");

/** Api Response */
router.get(
  "/",
  checkAuth,
  pagination(db.User, "_id", [{ model: db.Designation, required: false, as: "designation" }]),
  userController.getAllUser
);
router.get("/:id", v.ParamIsNumber, checkAuth, userController.getUserById);
router.post("/", checkAuth, v.User, userController.addUser);
router.post("/change_password", checkAuth, v.ChangePassword, userController.userChangePassword);
router.post("/forgot_password", v.Email, userController.userForgotPassword);
router.post("/login", v.Login, userController.login);
router.put("/:id", checkAuth, v.ParamIsNumber, userController.updateUser);
router.delete("/:id", checkAuth, v.ParamIsNumber, userController.deleteUser);

module.exports = router;
