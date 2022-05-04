const { validationResult } = require("express-validator");
// const moment = require("moment");
const db = require("../../SQL/database/mysql");
const v = require("../validators/validator");
const ErrorHandler = require("../../../utils/errorHandler");
const { GetById, GenerateToken } = require("../functions/reusableFunctions");

/**
 * SENDING LIST OF USER BASED ON QUERY OR DEFAULT VALUES
 * @param {*} req query: { limit, pageNo }
 * @param {*} res all user records based on query or default
 * @param {*} next
 * @returns
 */
exports.getAllUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      code: 0,
      result: res.paginatedData,
      message: res.paginatedData.rows.length ? "users fetched successfully" : "no users found",
    });
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 * SENDING USER DATA BASED ON ID
 * @param {*} req params: { id } userId
 * @param {*} res user data based on id
 * @param {*} next
 * @returns
 */
exports.getUserById = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    /** finding user by id */
    const user = await GetById(db.User, "_id", req.params.id, [
      { model: db.Designation, required: false, as: "designation" },
    ]);

    return res.status(200).json({
      code: 0,
      result: user,
      message: user ? "user fetched successfully" : "user not found",
    });
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 * ADDING USER TO THE TABLE
 * @param {*} req body: { name, email, password, mobile }
 * @param {*} res created user record
 * @param {*} next
 * @returns
 */
exports.addUser = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    /** checking if user present or not then creating the user */
    const [createdUser, isCreated] = await db.User.findOne({
      where: {
        [db.Op.or]: {
          email: req.body.email || "",
          mobile: req.body.mobile || "",
        },
      },
    }).then(async (data) => {
      if (data) {
        return [null, 0];
      }
      const user = await db.User.create(req.body);

      return [user, 1];
    });

    /** checking if exist or not */
    if (isCreated)
      return res.status(200).json({
        code: 0,
        result: createdUser,
        message: "user created successfully",
      });
    return next(new ErrorHandler({ code: 1, message: "user already exists" }));
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 * SENDING LOGIN USER DATA WITH TOKEN
 * @param {*} req body: { email/mobile, password }
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.login = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    /** check using email/mobile if user present or not */
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
      include: [{ model: db.Designation, required: false, as: "designation" }],
    }).then(async (user) => {
      /** if user not present */
      if (!user) return 1;

      if (req.body.admin) {
        const client = await db.Client.findAll({
          where: {
            adminId: {
              [db.Op.eq]: user._id,
            },
          },
        });
        if (client.length) {
          // eslint-disable-next-line no-console
          console.log("isAdmin");
        } else {
          return 1;
        }
      }

      /** if credentials are wrong */
      const isValid = await db.User.validPassword(req.body.password, user.password);
      if (!isValid) return 2;

      const TOKEN = GenerateToken(user);
      /** valid user */
      return { user, TOKEN };
    });

    if (userData === 1) return next(new ErrorHandler({ code: 1, message: "invalid credentials" }));
    if (userData === 2) return next(new ErrorHandler({ code: 1, message: "invalid credentials" }));
    return res.status(200).json({
      code: 0,
      result: userData,
      message: "login successfully",
    });
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 * UPDATE USER RECORD
 * @param {*} req body: { name/email/mobile } if value is there then it will change or else will remain unchanged
 * @param {*} res updated user data
 * @param {*} next
 * @returns
 */
exports.updateUser = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    const { firstName, lastName, gender, age, email, designationId, profilePicture, mobile } = req.body;

    const body = {};

    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (gender) body.gender = gender;
    if (age) body.age = age;
    if (email) body.email = email;
    if (designationId) body.designationId = designationId;
    if (profilePicture) body.profilePicture = profilePicture;
    if (mobile) body.mobile = mobile;

    const updatedUser = await db.User.update({ ...body }, { where: { _id: req.params.id, isDeleted: false } });
    return res.status(200).json({
      code: 0,
      result: updatedUser,
      message: "user updated successfully",
    });
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 *
 * @param {*} req params: { id } userId
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.deleteUser = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    const isDeleted = await db.User.update({ isDeleted: true }, { where: { _id: { [db.Op.eq]: req.params.id } } });

    /** checking if deleted or not */
    if (isDeleted)
      return res.status(200).json({
        code: 0,
        result: [],
        message: "deleted successfully",
      });
    return next(new ErrorHandler({ code: 1, message: "user not deleted" }));
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 *
 * @param {*} req body: { email}
 * @param {*} res updated user data
 * @param {*} next
 * @returns User will get a mail with new password
 */
exports.userForgotPassword = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    /** finding user by id */
    const user = await GetById(db.User, "email", req.body.email);

    if (!user) {
      return next(new ErrorHandler({ code: 1, message: "email not found" }));
    }

    const generatePassword = (Math.random() + 1).toString(36).substring(3);

    const dataToUpdate = {
      password: generatePassword,
    };

    const updatedUser = await db.User.update(
      { ...dataToUpdate },
      { where: { _id: user._id, isDeleted: false }, individualHooks: true }
    );

    /** checking if updated or not */
    if (updatedUser) {
      const text = `
      Hi ${user.firstName} ${user.lastName},

      We have received a request to change your password.
      Use this password "${generatePassword}" to login.

      Kind Regards,
      Administrator
      `;
      // sendMail(user.email, "New Password: System Generated", text);
      return res.status(200).json({
        code: 0,
        result: { updatedUser, text },
        message: "user updated successfully",
      });
    }
    return next(new ErrorHandler({ code: 1, message: "password didn't change" }));
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};

/**
 *
 * @param {*} req email/mobile, oldPassword, password, confirmPassword
 * @param {*} res updated user data
 * @param {*} next
 * @returns
 */
exports.userChangePassword = async (req, res, next) => {
  try {
    /** validation check */
    if (!validationResult(req).isEmpty()) {
      v.ValidationResponse(req, res);
      return null;
    }
    /** validation success */

    const dataToUpdate = {
      password: req.body.password,
    };

    const updatedUser = await db.User.update(
      { ...dataToUpdate },
      { where: { _id: req.userData._id, isDeleted: false }, individualHooks: true }
    );

    /** checking if updated or not */
    if (updatedUser)
      return res.status(200).json({
        code: 0,
        result: updatedUser,
        message: "user updated successfully",
      });
    return next(new ErrorHandler({ code: 1, message: "password didn't change" }));
  } catch (err) {
    return next(new ErrorHandler(err));
  }
};
