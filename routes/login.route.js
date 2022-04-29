let express = require('express');
let router = express.Router();
let userService = require('../service/login.service');
let {validationResult} = require('express-validator');
let validateLogin = require('../model/validator/login.validator');
let config = require('../config')
/* GET users listing. */
router.post('/login', validateLogin.validateLogin(), function(req, res, next) {

  const errors = validationResult(req);
  errors.array().map(v => {
    v.message = req.__(v.msg);
  })
  if (!errors.isEmpty()) {
    config.response(res, errors.array(), config.httpStatus.badRequest);
    return;
  }

  return userService.login(req, res);
});

module.exports = router;
