var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var staffExperiencesService = require('../service/staff_experiences.service');
var staffExperiencesValidator = require('../model/validator/staff_experiences.validator');
var config = require('../config');


router.get('/experiences',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffExperiencesService.findAll(req, res);
});

router.post('/experiences',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffExperiencesService.create(req, res);
});

router.put('/experiences/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffExperiencesService.update(req, res);
});

router.delete('/experiences/:id', function(req, res, next) {
  return staffExperiencesService.deleteExperience(req, res);
});


module.exports = router;
