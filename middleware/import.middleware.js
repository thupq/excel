const multer = require('multer');
const path = require('path');
const config = require('../config');

const excelFilter = (req, file, cb) => {
    if ( file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.dirname(__dirname) + '/resources/import/');
    },
    filename: (req, file, cb) => {
        let date = new Date(Date.now());

        cb(null, `${config.convertDateToString(date, 'yyyy_mm_dd_HH_MM_ss')}-${file.originalname}`);
    }
});


var importFile = multer({
    storage: storage,
    fileFilter: excelFilter
});

module.exports = importFile;
