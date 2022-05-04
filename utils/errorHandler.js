class ErrorHandler extends Error {
  constructor(err) {
    super(err.message);
    this.err = err;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
