var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var namingSystemService = require('../service/core_positions.service');
var config = require('../config');
const importExcel = require('../middleware/import.middleware')


router.post('/naming-system/search',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return namingSystemService.findAll(req, res);
});


router.post('/naming-system',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return namingSystemService.create(req, res);
});

router.put('/naming-system/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return namingSystemService.update(req, res);
});

router.post('/naming-system/delete', function(req, res, next) {
  return namingSystemService.deleteNamingSystem(req, res);
});

router.post('/naming-system/export', function(req, res, next) {
  return namingSystemService.exportExcel(req, res);
});

router.post('/naming-system/export/template', function(req, res, next) {
  return namingSystemService.exportTemplate(req, res);
});


router.post('/naming-system/import', importExcel.single("file"),function(req, res, next) {
  return namingSystemService.importExcel(req, res);
});


module.exports = router;
