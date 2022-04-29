const jwt = require("jsonwebtoken");
let config = require('../config');
const {now} = require("moment");


const verifyToken = (req, res, next) => {
  let token = req.headers["Authorization"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    if(token.includes("Bearer")) {
      token = token.substring(7, token.length);
    }
    const decoded = jwt.verify(token, config.jwtSecretKey);
    req.user = decoded;
    req.currentTime = now();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
