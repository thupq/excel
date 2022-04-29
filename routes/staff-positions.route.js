var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var staffPositionsService = require('../service/staff_positions.service');
const importExcel = require('../middleware/import.middleware')

/**
 * Search list staff positions
 */
router.post('/staff-positions/search', function(req, res, next) {
    // Validate
    return staffPositionsService.findAll(req, res);
})

/**
 * Create new staff position
 */
router.post('/staff-positions', function(req, res, next) {
    // Validate
    return staffPositionsService.create(req, res);
})

/**
 * Check data before create new staff position
 */
router.post('/staff-positions/check-data', function(req, res, next) {
    // Validate
    return staffPositionsService.checkData(req, res);
})

/**
 * Update staff position
 */
router.put('/staff-positions/:id', function(req, res, next) {
    // Validate
    return staffPositionsService.update(req, res);
})

/**
 * Delete staff position
 */
router.delete('/staff-positions/:id', function(req, res, next) {
    // Validate
    return staffPositionsService.deletePosition(req, res);
})

/**
 * Method export template staff position
 */
router.post('/staff-positions/export/excel', function(req, res, next) {
    // Validate
    return staffPositionsService.exportTemplate(req, res);
})

/**
 * Method export data staff posistions
 */
router.post('/staff-positions/export', function(req, res, next) {
    // Validate
    return staffPositionsService.exportExcel(req, res);
})

/**
 * Method import data staff posistions
 */
 router.post('/staff-positions/import', importExcel.single("file"), function(req, res, next) {
    // Validate
    return staffPositionsService.importExcel(req, res);
})
module.exports = router;