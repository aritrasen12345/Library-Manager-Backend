const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET);

    req.payload = jwt.verify(req.headers.authorization.split(" ")[1], process.env.SECRET);
    next();
  } catch (error) {
    res.status(401).json({ code: 401, result: [], message: "Token not verified!" });
  }
};
