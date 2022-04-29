var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');
const importExcel = require('../middleware/import.middleware')

var strategicStaffingService = require('../service/strategic_staffing.service');
var config = require('../config');

router.post('/strategic-staffing/search',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return strategicStaffingService.findAll(req, res);
});


router.post('/strategic-staffing',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return strategicStaffingService.create(req, res);
});

router.put('/strategic-staffing/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return strategicStaffingService.update(req, res);
});

router.post('/strategic-staffing/delete', function(req, res, next) {
  return strategicStaffingService.deleteStrategicStaffing(req, res);
});

router.post('/strategic-staffing/number-employee-current', function(req, res, next) {
  return strategicStaffingService.numberEmployeeCurrent(req, res);
});



router.post('/strategic-staffing/export', function(req, res, next) {
  return strategicStaffingService.exportExcel(req, res);
});

router.post('/strategic-staffing/export/template', function(req, res, next) {
  return strategicStaffingService.exportTemplate(req, res);
});


router.post('/strategic-staffing/import', importExcel.single("file"),function(req, res, next) {
  return strategicStaffingService.importExcel(req, res);
});



module.exports = router;
