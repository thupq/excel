var express = require('express');
var router = express.Router();
let {validationResult} = require('express-validator');

var rewardAndDisciplineService = require('../service/reward_and_discipline.service');
const importExcel = require('../middleware/import.middleware')

/**
 * Search list rewards and disciplines
 */
router.post('/reward-and-discipline/search', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.findAll(req, res);
})

/**
 * Create new rewards and disciplines
 */
router.post('/reward-and-discipline', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.create(req, res);
})

/**
 * Update rewards and disciplines
 */
router.put('/reward-and-discipline/:id', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.update(req, res);
})

/**
 * Delete rewards and disciplines
 */
router.delete('/reward-and-discipline/:id', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.deleteRewardAndDiscipline(req, res);
})

/**
 * Method export template rewards and disciplines
 */
router.post('/reward-and-discipline/export/excel', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.exportTemplate(req, res);
})

/**
 * Method export data rewards and disciplines
 */
router.post('/reward-and-discipline/export', function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.exportExcel(req, res);
})

/**
 * Method import data rewards and disciplines
 */
router.post('/reward-and-discipline/import', importExcel.single("file"), function(req, res, next) {
    // Validate
    return rewardAndDisciplineService.importExcel(req, res);
})
module.exports = router;