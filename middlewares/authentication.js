// const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnAuthenticated } = require("../errors");

const authenticationMiddleware = async (req, res, next) => {
  // check headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticated("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWTSECRET);
    req.user = { userId: payload.userId, email: payload.email};
    next();
  } catch (error) {
    throw new UnAuthenticated("Not Authorized");
  }
};

module.exports = authenticationMiddleware;
