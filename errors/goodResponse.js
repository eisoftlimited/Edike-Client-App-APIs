const CustomApiError = require("./customApies");
const { StatusCodes } = require("http-status-codes");
class GoodResponse extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.OK;
  }
}

module.exports = GoodResponse;
