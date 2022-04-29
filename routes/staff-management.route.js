var express = require('express');
const importExcel = require('../middleware/import.middleware')
var router = express.Router();
var staffService = require('../service/staff.service');
var staffExcelService = require('../service/staff_excel.service');
/*
* Get Staffs
* */
router.get('/staffs', function (req, res, next) {
    return staffService.findAll(req, res);
});

router.post('/staffs/export', function (req, res, next) {
    return staffExcelService.exportData(req, res);
});

router.post('/staffs', function (req, res, next) {
    return staffService.create(req, res);
});

router.put('/staffs', function (req, res, next) {
    return staffService.update(req, res);
});

router.delete('/staffs/:id', function (req, res, next) {
    return staffService.deleteStaff(req, res);
});

router.get('/staffs/:id', function (req, res, next) {
    return staffService.findOne(req, res);
});

router.post('/staffs/export/template', function (req, res, next) {
    return staffExcelService.exportTemplate(req, res);
});

router.post('/staffs/import', importExcel.single('file'), function (req, res, next) {
    return staffExcelService.importTemplate(req, res);
});


module.exports = router;
