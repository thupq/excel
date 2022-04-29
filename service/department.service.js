const db = require("../config/database-config");
let config = require('../config');
const Departments = db.db.Departments;


function findAll(req, res) {
    Departments.findAll({
        where: {
            is_active: config.active.true
        },
        order: [
            ['dep_name', 'ASC']
        ]
    })
        .then(result => {
            config.response(res, result, config.httpStatus.success, req.__('system.success'));
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });

}

function findTreeByStaffId(staffId) {

}

module.exports = {
    findAll: findAll,
}
