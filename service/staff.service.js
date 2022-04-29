const db = require("../config/database-config");
let config = require('../config');
const {now} = require("moment");
const moment = require('moment');
let dictTypeRepo = require('../model/repositories/dict_types.custom');
let departmentRepo = require('../model/repositories/department.custom');
let positionRepo = require('../model/repositories/position.custom');
let staffRepo = require('../model/repositories/staff.custom');
const Staffs = db.db.Staffs;
const DictItems = db.db.DictItems;
const Sequelize = require('sequelize');
const Excel = require('exceljs');
let dictItemRepo = require('../model/repositories/dict_items.custom');
let staffPositionsService = require('./staff_positions.service');


async function findAll(req, res) {
    const searchObj = {
        name: req.query['name'],
        staffId: req.query['staffId'],
        departmentId: req.query['departmentId'],
        positionCateId: req.query['positionCateId'],
        positionItemId: req.query['positionItemId'],
        fromDate: req.query['fromDate'],
        toDate: req.query['toDate'],
        page: req.query['page'],
        size: req.query['size'],
        getAll: req.query['getAll'],
    }

    let count = await staffRepo.searchAll(searchObj, true, searchObj.getAll);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );
    try {
        let staffs = await staffRepo.searchAll(searchObj, false, searchObj.getAll);
        for (let i = 0; i < staffs.length; i++) {
            let staff = staffs[i];
            //1. departments
            staff.department = await departmentRepo.findMainDepartmentByStaffId(staff.id);
            staff.departments = [];
            if (staff.department[0]) {
                staff.departments = await departmentRepo.findTreeDepartmentByDeptd(staff.department[0].id);
            }
            //2 vi tri cong viec
            let mainPos = await staffPositionsService.getMainPosition(staff.id);
            if (mainPos[0]) {
                mainPos = mainPos[0];
                let corePos = await positionRepo.getPositionById(mainPos.position_id);
                if (corePos[0]) {
                    staff.position = corePos[0];
                    if(staff.position.level) {
                        let levelItem = await db.db.DictItems.findOne({where: {id: staff.position.level}, raw: true});
                        staff.position.level = levelItem;
                    }
                    //chuc danh
                    let dicType = await db.db.DictItems.findOne({where: {id: staff.position.parent_id, is_active: '1'}, raw: true});
                    staff.positionType = dicType;
                }
                //3. ngach
                if (staff.position) {
                    let itemPos = staff.position.glone ? await DictItems.findOne(
                        {
                            where: {
                                id: staff.position.glone
                            },
                            raw: true
                        }) : null;
                    staff.glone = itemPos;
                }
            }

            //Nguyen quan
            if(staff.country_of_origin){
                let trees = await dictTypeRepo.findDictTreeParent(staff.country_of_origin);
                staff.countryOfOrigins = trees;
            }


        }
        config.response(res, staffs, config.httpStatus.success, req.__('system.success'));
    } catch (error) {
        config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
    }


}

async function create(req, res) {
    try {
        const body = req.body;
        const citizen_id_no = await staffRepo.findByCitizenIdNo(body.citizen_id_no);
        if (citizen_id_no.length > 0) {
            config.response(res, null, config.httpStatus.badRequest, req.__('staff.exist'));
        }

        const code = await staffRepo.selectNextStaffId();
        body.id = code[0].nextval;
        let staff = {
            ...body,
            staff_id: `${config.prefix_system_code.staff}${code[0].nextval}`,
            created_by: req.user.email.email,
            created_time: now(),
            updated_by: req.user.email.email,
            updated_time: now(),
        };
        db.db.Staffs.create(staff).then(result => {
            config.response(res, result, config.httpStatus.success, req.__('staff.created.success'));
        }).catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('staff.created.failed'));
        });
    } catch (e) {
        config.logError(e, req);
    }
}

async function update(req, res) {
    try {
        const body = req.body;
        let staff = await Staffs.findByPk(body.id);
        if (!staff) {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff.notexist'));
        }

        staff = {
            ...staff,
            ...body,
            updated_time: now(),
            updated_by: req.user.email.email,
        };
        Staffs.update(staff, {where: {id: staff.id}}).then(result => {
            config.response(res, result, config.httpStatus.success, req.__('staff.update.success'));
        }).catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('staff.update.failed'));
        });
    } catch (e) {
        config.logError(e, req);
    }
}

function findOne(req, res) {
    let id = req.params['id'];
    let search = req.query['search'];
    if (id) {
        db.db.Staffs.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            })
            .then(async result => {
                result.department = await departmentRepo.findMainDepartmentByStaffId(id);
                config.response(res, result, config.httpStatus.success, req.__('system.success'));
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('staff.notexist'));
    }

}

function deleteStaff(req, res) {
    let id = req.params['id'];
    if (id) {
        db.db.Staffs.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('staff.delete.not_found'));
                return;
            }
            result.is_active = config.active.false;
            config.audit(result, req, true);
            db.db.Staffs.update(result,
                {
                    where: {id: id},
                })
                .then(updated => {
                    config.response(res, result, config.httpStatus.success, req.__('staff.delete.success'));
                }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            });
        })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('staff.notexist'));
    }
}


module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    findOne: findOne,
    deleteStaff: deleteStaff,
}
