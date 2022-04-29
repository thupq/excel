var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');
const importExcel = require('../middleware/import.middleware')

var dictTypeService = require('../service/dict_types.service');
var dictTypeValidator = require('../model/validator/dict_types.validator');
var dictItemValidator = require('../model/validator/dict_items.validator');
var config = require('../config');

/* GET users listing. */
router.get('/categories', function(req, res, next) {
  return dictTypeService.findAll(req, res);
});

router.post('/categories',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return dictTypeService.create(req, res);
});

router.put('/categories/:id',  function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return dictTypeService.update(req, res);
});

router.get('/categories/:id', function(req, res, next) {
  return dictTypeService.findOne(req, res);
});

router.delete('/categories/:id', function(req, res, next) {
  return dictTypeService.deleteDict(req, res);
});

router.post('/categories/multidelete', function(req, res, next) {
  return dictTypeService.deleteDicts(req, res);
});


router.post('/categories/:id/item', function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return dictTypeService.createItem(req, res);
});

router.put('/categories/:id/item/:item_id', function(req, res, next) {
  // const errors = validationResult(req);
  // errors.array().map(v => {
  //   v.message = req.__(v.msg);
  // })
  // if (!errors.isEmpty()) {
  //   config.response(res, errors.array(), config.httpStatus.badRequest);
  //   return;
  // }
  return dictTypeService.updateItem(req, res);
});

router.delete('/categories/:id/item/:item_id', function(req, res, next) {
  return dictTypeService.deleteItem(req, res);
});

router.post('/categories/:id/item/multidelete', function(req, res, next) {
  return dictTypeService.deleteItems(req, res);
});


router.post('/categories/export', function(req, res, next) {
  return dictTypeService.exportExcel(req, res);
});

router.get('/load-category', function(req, res, next) {
  return dictTypeService.loadCategory(req, res);
});

router.post('/categories/downloadtemplate', function(req, res, next) {
  return dictTypeService.downloadTemplate(req, res);
});

router.post('/categories/import', importExcel.single('file'),function(req, res, next) {
  if(config.current_import_mode === config.dict_type_import_mode.on) {
    return dictTypeService.importTemplate2(req, res);
  }
  return dictTypeService.importTemplate(req, res);

});


router.get('/categories/parent-tree/:id',function(req, res, next) {
  return dictTypeService.getparentTree(req, res);
});


module.exports = router;
