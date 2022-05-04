/* eslint-disable arrow-body-style */
/* eslint-disable func-names */
/**
 * PAGINATION MIDDLEWARE BASED ON PAGE NUMBER AND LIMIT
 * @param {object} modelName from sequelize model
 * @param {*} orderBy column name
 * @returns next()
 */
const pagination = (modelName, orderBy, include = [], condition = []) => {
  return function (req, res, next) {
    const defaultLimit = 20;
    const defaultPageNo = 1;
    const where = { isDeleted: 0 };

    const queryKeys = Object.keys(req.query);

    condition.forEach((con) => {
      if (queryKeys.includes(con)) where[con] = req.query[con];
    });

    let direction = "asc";
    if (req.query.direction === "asc" || req.query.direction === "desc") direction = req.query.direction;

    const limit = Math.abs(+req.query.limit) || defaultLimit;
    const pageNo = Math.abs(+req.query.pageNo) || defaultPageNo;

    const requestedNumberOfRecords = pageNo * limit;

    const path = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("?")[0];

    /** fetching all records */
    modelName
      .findAndCountAll({
        where,
        include,
        offset: (pageNo - 1) * limit,
        limit,
        order: [[orderBy, direction]],
      })
      .then((response) => {
        const data = response;
        /** if requested number of records are greater than count */
        if (data.count <= requestedNumberOfRecords) {
          data.nextUrl = null;
          data.limit = null;
          data.pageNo = null;
        } else {
          data.nextUrl = `${path}?limit=${limit}&pageNo=${pageNo + 1}`;
          data.limit = limit;
          data.pageNo = pageNo + 1;
        }

        res.paginatedData = data;
        next();
      });
  };
};

module.exports = pagination;
