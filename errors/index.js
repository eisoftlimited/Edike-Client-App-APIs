const CustomApiError = require("./customApies");
const UnAuthenticated = require("./unAuthenticated");
const NotFound = require("./not-found");
const BadRequest = require("./badRequest");
const GoodResponse = require("./goodResponse");

module.exports = {
  CustomApiError,
  UnAuthenticated,
  BadRequest,
  GoodResponse,
  NotFound,
};
