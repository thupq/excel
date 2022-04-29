var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var staffContractsService = require('../service/staff_contracts.service');
var staffContractsValidator = require('../model/validator/staff-contracts.validator');
var config = require('../config');
const importExcel = require('../middleware/import.middleware')

router.post('/staff-contracts/search',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffContractsService.findAll(req, res);
});


router.post('/staff-contracts',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffContractsService.create(req, res);
});

router.put('/staff-contracts/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return staffContractsService.update(req, res);
});

router.delete('/staff-contracts/:id', function(req, res, next) {
  return staffContractsService.deleteContract(req, res);
});

router.post('/staff-contracts/export/excel', function(req, res, next) {
  return staffContractsService.exportTemplate(req, res);
});

router.post('/staff-contracts/export', function(req, res, next) {
  return staffContractsService.exportExcel(req, res);
});

router.post('/staff-contracts/import', importExcel.single("file"), function(req, res, next) {
  return staffContractsService.importExcel(req, res);
});


router.get('/staff-contracts/generate', function(req, res, next) {
  return staffContractsService.generateContractNo(req, res);
});


module.exports = router;
