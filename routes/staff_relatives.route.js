var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var staffRelativesService = require('../service/staff_relatives.service');
var staffRelativesValidator = require('../model/validator/staff_relatives.validator');
var config = require('../config');

router.get('/relatives',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffRelativesService.findAll(req, res);
});

router.post('/relatives',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffRelativesService.create(req, res);
});

router.put('/relatives/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffRelativesService.update(req, res);
});

router.delete('/relatives/:id', function(req, res, next) {
  return staffRelativesService.deleteRelative(req, res);
});


module.exports = router;
