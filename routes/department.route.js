var express = require('express');
var router = express.Router();
var departmentService = require('../service/department.service');

/*
* Get Staffs
* */
router.get('/departments', function (req, res, next) {
    return departmentService.findAll(req, res);
});
//
// router.post('/staffs',  function(req, res, next) {
//     return staffService.create(req, res);
// });
//
// router.put('/staffs',  function(req, res, next) {
//     return staffService.update(req, res);
// });
//
// router.delete('/staffs/:id',  function(req, res, next) {
//     return staffService.deleteStaff(req, res);
// });


module.exports = router;
