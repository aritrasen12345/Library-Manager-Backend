const { check, param, oneOf, query } = require("express-validator");
const { validationResult } = require("express-validator");
const db = require("../../SQL/database/mysql");

// eslint-disable-next-line arrow-body-style
exports.ValidationResponse = (req, res) => {
  return res.status(400).json({
    code: 400,
    message: validationResult(req)
      .array()
      .map((e) => e.msg),
    error: validationResult(req).array(),
  });
};

exports.ParamIsNumber = [param("id").isNumeric().withMessage("params has to be numeric")];

exports.Designation = [check("name").trim().escape().not().isEmpty().withMessage("name is required")];

exports.Sprint = [
  check("clientId").isNumeric().not().isEmpty().withMessage("clientId is required"),
  check("projectId").isNumeric().not().isEmpty().withMessage("projectId is required"),
  check("sprint").trim().escape().not().isEmpty().withMessage("sprint is required"),
];

exports.Label = [
  check("clientId").isNumeric().not().isEmpty().withMessage("clientId is required"),
  check("projectId").isNumeric().not().isEmpty().withMessage("projectId is required"),
  check("label").trim().escape().not().isEmpty().withMessage("label is required"),
];

exports.User = [
  check("firstName").trim().escape().not().isEmpty().withMessage("firstName is required"),
  check("lastName").trim().escape().not().isEmpty().withMessage("lastName is required"),
  check("email")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage("valid Email is required"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
  check("mobile")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("mobile is required")
    .bail()
    .isLength({ min: 10, max: 10 })
    .withMessage("mobile should be 10 character long")
    .isNumeric()
    .withMessage("mobile should be numbers"),
];

exports.UserWoPassword = [
  check("name").optional().trim().escape().not().isEmpty().withMessage("Name is required"),
  check("email")
    .optional()
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("valid Email is required")
    .custom(async (value, { req }) => {
      const userData = await db.User.findOne({
        where: {
          email: {
            [db.Op.eq]: value,
          },
          isDeleted: {
            [db.Op.eq]: false,
          },
        },
      }).then(async (user) => {
        /** if user not present */
        if (!user) return 1;

        if (user.userId === +req.params.id) return 1;

        return 0;
      });

      if (userData === 0) throw new Error("email already exists");

      return true;
    }),
  check("mobile")
    .optional()
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("mobile is required")
    .bail()
    .isLength({ min: 10, max: 10 })
    .withMessage("mobile should be 10 character long")
    .isNumeric()
    .withMessage("mobile should be numbers"),
];

exports.Login = [
  oneOf(
    [
      check("email")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("valid Email is required"),
      check("mobile")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("mobile is required")
        .bail()
        .isLength({ min: 10, max: 10 })
        .withMessage("mobile should be 10 character long")
        .isNumeric()
        .withMessage("mobile should be numbers"),
    ],
    "either email or mobile is required"
  ),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
];

exports.Email = [
  check("email")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("valid Email is required"),
];

exports.ChangePassword = [
  oneOf(
    [
      check("email")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("valid Email is required"),
      check("mobile")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("mobile is required")
        .bail()
        .isLength({ min: 10, max: 10 })
        .withMessage("mobile should be 10 character long")
        .isNumeric()
        .withMessage("mobile should be numbers"),
    ],
    "either email or mobile is required"
  ),
  check("oldPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("oldPassword should be at least 6 character long")
    .bail()
    .custom(async (value, { req }) => {
      const userData = await db.User.findOne({
        where: {
          [db.Op.or]: {
            email: req.body.email || "",
            mobile: req.body.mobile || "",
          },
          isDeleted: {
            [db.Op.eq]: false,
          },
        },
      }).then(async (user) => {
        /** if user not present */
        if (!user) return 1;

        /** if credentials are wrong */
        const isValid = await db.User.validPassword(value, user.password);
        if (!isValid) return 2;

        return user;
      });

      if (userData === 1 || userData === 2) throw new Error("invalid old password");

      req.userData = userData;

      return true;
    }),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
  check("confirmPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("confirmPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("confirmPassword should be at least 6 character long")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password didn't match with confirmPassword");
      }
      return true;
    }),
];

exports.Client = [check("companyName").trim().escape().not().isEmpty().withMessage("companyName is required")];

exports.Project = [
  check("clientId").isNumeric().not().isEmpty().withMessage("clientId is required"),
  check("projectName").trim().escape().not().isEmpty().withMessage("projectName is required"),
];

exports.MyTask = [
  query("clientId").isNumeric().not().isEmpty().withMessage("clientId is required"),
  query("projectId").isNumeric().not().isEmpty().withMessage("projectId is required"),
];

exports.MySubtask = [
  query("clientId").isNumeric().not().isEmpty().withMessage("clientId is required"),
  query("projectId").isNumeric().not().isEmpty().withMessage("projectId is required"),
  query("taskId").isNumeric().not().isEmpty().withMessage("taskId is required"),
];

exports.Task = [
  check("clientId").isNumeric().escape().not().isEmpty().withMessage("clientId is required"),
  check("projectId").isNumeric().escape().not().isEmpty().withMessage("projectId is required"),
  check("task").trim().escape().not().isEmpty().withMessage("task is required"),
];

exports.Subtask = [
  check("clientId").isNumeric().escape().not().isEmpty().withMessage("clientId is required"),
  check("projectId").isNumeric().escape().not().isEmpty().withMessage("projectId is required"),
  check("taskId").isNumeric().escape().not().isEmpty().withMessage("taskId is required"),
  check("subtask").trim().escape().not().isEmpty().withMessage("subtask is required"),
];
