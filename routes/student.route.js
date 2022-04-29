var express = require('express');
var router = express.Router();
var studentService = require('../service/student.service');
const importExcel = require('../middleware/import.middleware')

router.post('/student', function (req, res, next) {
    return studentService.create(req, res);
});
router.put('/student', function (req, res, next) {
    return studentService.update(req, res);
});
router.delete('/student/:id', function (req, res, next) {
    return studentService.deleteStudent(req, res);
});
router.get('/student/:id', function (req, res, next) {
    return studentService.findOne(req, res);
});
router.post('/student/search', function (req, res, next) {
    return studentService.findAll(req, res);
});
// router.post('/student/export', function (req, res, next) {
//     return studentService.exportData(req, res);
// });
router.post('/student/export/template', function (req, res, next) {
    return studentService.exportTemplate(req, res);
});
router.post('/student/import', importExcel.single('file'), function (req, res, next) {
    return studentService.importTemplate(req, res);
});

module.exports = router;