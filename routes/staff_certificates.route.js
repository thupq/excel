var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var staffCertificatesService = require('../service/staff_certificates.service');
var staffCertificatesValidator = require('../model/validator/staff_certificates.validator');
var config = require('../config');

router.get('/certificates',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffCertificatesService.findAll(req, res);
});

router.post('/certificates',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffCertificatesService.create(req, res);
});

router.put('/certificates/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffCertificatesService.update(req, res);
});

router.delete('/certificates/:id', function(req, res, next) {
  return staffCertificatesService.deleteCertificate(req, res);
});


module.exports = router;
