const { StatusCodes } = require("http-status-codes");
const CustomApiError = require("./customApies");

class NotFound extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFound;
