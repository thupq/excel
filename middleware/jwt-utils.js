var jwt = require('jsonwebtoken');
var config = require('../config')

module.exports.generateAccessToken = function(user) {
  return jwt.sign({email: user}, config.jwtSecretKey, {expiresIn: "1000h"});
}
