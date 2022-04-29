const {check, validationResult} = require('express-validator');

var validateLogin = () => {
  var validate = [
      check('email').trim().notEmpty().withMessage('login.email.empty').bail(),
      check('email').trim().isEmail().withMessage('login.email.error').bail(),
      check('password').trim().notEmpty().withMessage('login.password.empty').bail()
  ];
  return validate;
}

module.exports = {validateLogin};



