const db = require("../config/database-config");
const config = require('../config');
const {now} = require("moment");
const Excel = require('exceljs');
const path = require('path');
const moment = require('moment');
const staffPositionsRepo = require('../model/repositories/staff_positions.custom');
const departmentRepo = require('../model/repositories/department.custom');
const dictTypeRepo = require('../model/repositories/dict_types.custom');
const dictItemRepo = require('../model/repositories/dict_items.custom');
const staffRepo = require('../model/repositories/staff.custom');
const corePositionsRepo = require('../model/repositories/core_positions.custom');
const staff_positions_dto = require('../model/dto/staff_positions.dto');
const bodyParser = require("body-parser");
const { searchAllExcel } = require("../model/repositories/staff.custom");
const { body } = require("express-validator");
const { validate } = require("express-validation");

const StaffPositions = db.db.StaffPositions;

/**
 * Function search data staff positions
 * @param {Object} searchObj condition search
 * @returns Array data
 */
async function search(searchObj, isCount, getAll) {
    let datas = await staffPositionsRepo.findAll(searchObj, isCount, getAll);
    if(datas.length > 0) {
        for(let data of datas) {
            if (data.dept_id) {
                data.departments = await departmentRepo.findTreeDepartmentByDeptd(data.dept_id);
            }

            if(data.start_date) {
                data.start_date = moment(data.start_date).format(config.date_format.dd_mm_yyyy2);
            }
            if(data.end_date) {
                data.end_date = moment(data.end_date).format(config.date_format.dd_mm_yyyy2);
            }
        }
    }

    return datas;
}

/**
 * Service search all staff positions
 * @param {*} req 
 * @param {*} res 
 */
async function findAll(req, res) {
    const searchObj = {
        name: req.body['name'],
        staff_code: req.body['staff_id'],
        time: req.body['time'],
        action: req.body['action'],
        action_type: req.body['action_type'],
        staff_title: req.body['title'], //chuc danh
        job_position: req.body['job_position'],   //vi tri cong viec
        dept_id: req.body['dept_id'], //don vi
        page: req.body['page'],
        size: req.body['size']
    }

    let count = await staffPositionsRepo.findAll(searchObj,true, true);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await search(searchObj, false, false);

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));
}

/**
 * Check date
 * @param {Object} beforeDate 
 * @param {Object} date 
 * @param {Object} afterDate 
 */
function checkDate(beforeRecord, changeRecord, afterRecord) {
    const returnSuccessObj = {
        status: 'success'
    }
    if(!!beforeRecord.start_date) {
        if(changeRecord.start_date.isAfter(beforeRecord.start_date)) {
            if(!!afterRecord.start_date) {
                if(changeRecord.start_date.isBefore(afterRecord.start_date)) {
                    if(!!changeRecord.end_date && changeRecord.end_date.isBefore(afterRecord.start_date)) {
                        if(!!beforeRecord.end_date && changeRecord.start_date.isAfter(beforeRecord.end_date))
                            return returnSuccessObj;
                        return {
                            status: 'option',
                            end_date_option: changeRecord.start_date.subtract(1, 'day'),
                        }
                    }
                }
            } else {
                if(!!beforeRecord.end_date && changeRecord.start_date.isAfter(beforeRecord.end_date))
                    return returnSuccessObj;
                return {
                    status: 'option',
                    end_date_option: changeRecord.start_date.subtract(1, 'day'),
                }
            }
        }    
    } else {
        if(!!afterRecord.start_date){
            if(changeRecord.start_date.isBefore(afterRecord.start_date)) {
                if(!!changeRecord.end_date && changeRecord.end_date.isBefore(afterRecord.start_date)) 
                    return returnSuccessObj;
            }
        } else return returnSuccessObj;
    }
    return {
        status: 'error',
        start_date_before: beforeRecord.start_date,
        start_date_after: afterRecord.start_date,
        errorMessage: 'Start date invalid'
    }
}

/**
 * Validate data for create and update
 * @param {Object} data 
 */
async function validateData(data) {
    const returnSuccessObj = {
        status: 'success'
    }
    // Get value in body
    const start_date = data.start_date;
    const end_date = data.end_date;
    const action_id = data.action;
    const staff_id = data.staff_id;
    const staff_position_id = data.id;

    const isUpdate = !!staff_position_id;
    if(isUpdate && !start_date) return returnSuccessObj;

    // Get action for get parent name action
    const action = await dictItemRepo.findByListItemIds([action_id]);
    if(action.length > 0) {
        // parent name is BIEN_DONG_ANH_HUONG_QTCT
        if(action[0].parent_name == config.DICT_ITEM_NAME.BIEN_DONG_ANH_HUONG_QTCT){
            let staffPositions = await staffPositionsRepo.findByStaffId(staff_id);
            staffPositions = staffPositions.filter(staffPosition => {
                return staffPosition.action_type_name == config.DICT_ITEM_NAME.BIEN_DONG_ANH_HUONG_QTCT 
                    ||  staffPosition.action_name == config.DICT_ITEM_NAME.NGHI_VIEC 
                    || staffPosition.id == staff_position_id;
            })

            if(staffPositions.length > 0) {
                if(staffPositions.length == 1 && isUpdate) {
                    return returnSuccessObj;
                }
                
                let start_date_before = undefined;
                let end_date_before = undefined;
                let staff_position_before = undefined;
                let start_date_change = moment(start_date);
                let end_date_change = !!end_date ? moment(end_date) : undefined ;
                let start_date_after = undefined;

                if(isUpdate) {
                    staffPositions.map((staffPosition, indexArr) => {
                        if(staffPosition.id == staff_position_id) {
                            staffPositions[indexArr].start_date = start_date;
                            staffPositions[indexArr].end_date = end_date;
                        }
                    })
                }

                // Get start_date_ last, end_date_last and id staff position before
                staffPositions = staffPositions.sort((staffPositionA, staffPositionB) => {
                    if(moment(staffPositionA.start_date).isBefore(moment(staffPositionB.start_date)))
                        return -1;
                    if(moment(staffPositionA.start_date).isAfter(moment(staffPositionB.start_date)))
                        return 1;
                    return 0;
                })

                let index = staffPositions.length - 1;
                if(isUpdate) {
                    staffPositions.map((staffPosition, indexArr) => {
                        if(staffPosition.id == staff_position_id) {
                            index = indexArr;
                        }
                    })

                    start_date_before = 
                        index > 0 
                        ? moment(staffPositions[index - 1].start_date) 
                        : undefined;

                    end_date_before = 
                        index > 0 && !!staffPositions[index - 1].end_date 
                        ? moment(staffPositions[index - 1].end_date) 
                        : undefined;

                    staff_position_before = 
                        index > 0
                        ? staffPositions[index - 1]
                        : undefined;

                    start_date_after = 
                        index < staffPositions.length - 1 
                        ? moment(staffPositions[index + 1].start_date) 
                        : undefined;
                } else {
                    start_date_before = moment(staffPositions[index].start_date);
                    end_date_before = 
                        !!staffPositions[index].end_date 
                        ? moment(staffPositions[index].end_date) 
                        : undefined;

                    staff_position_before = staffPositions[index];
                }

                const beforeRecord = {
                    start_date: start_date_before,
                    end_date: end_date_before
                };
                const changeRecord = {
                    start_date: start_date_change,
                    end_date: end_date_change
                }
                const afterRecord = {
                    start_date: start_date_after
                }
                
                const resultCheckDate =  checkDate(beforeRecord, changeRecord, afterRecord);
                return {
                    ...resultCheckDate,
                    staff_position_before,
                }
            }   
            return returnSuccessObj;
        }
        return returnSuccessObj;
    } 
    return {
        status: 'error',
        errorMessage: 'Action invalid'
    }
}

/**
 * Update end date before record
 * @param {*} req 
 * @param {*} res 
 * @param {Object} body 
 */
async function updateEndDateBeforeRecord(req, res, body) {
    db.db.StaffPositions.update(body,{
            where: { id: body.id },
        }).then(updated => {
            return;
        }).catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.updateEndDateBeforeRecord.failed'));
        });
}

/**
 * Service create staff position
 * @param {*} req 
 * @param {*} res 
 */
async function create(req, res) {
    let body = req.body;
    const validateDataResult = await validateData(body);
    if(validateDataResult.status == 'error') {
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.created.failed'));
    }
    body.is_active = config.active.true;
    config.audit(body, req, false);
    let id = await db.getNextSequence(config.sequence.core_positions_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.staff_positions + id;

    db.db.Positions.findOne({
        where: {
            job_position: body.job_position,
            dept_id: body.dept_id,
            is_active: config.active.true
        },
        raw: true,
    }).then(result => {
        if (!result) {
            config.response(res, result, config.httpStatus.badRequest, req.__('staff_positions.created.not_found_position'));
        }

        body.position_id = result.id;
        db.db.StaffPositions.create(body).then(result => {
            // Update end_date before record 
            if(validateDataResult.status == 'option') {
                const staff_position_before = validateDataResult.staff_position_before;
                staff_position_before.end_date = validateDataResult.end_date_option.format(config.date_format.yyyy_mm_dd);
                updateEndDateBeforeRecord(req, res, staff_position_before);
            }
                
            config.response(res, result, config.httpStatus.success, req.__('staff_positions.created.success'));
        }).catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.created.failed'));
        })
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__("staff_positions.created.find_position_failed"));
    })
}

/**
 * Check data create new staff position
 * @param {*} req 
 * @param {*} res 
 */
async function checkData(req, res) {
    const body = req.body;
    const validateDataResult = await validateData(body);
    delete validateDataResult.staff_position_before;
    if(!!validateDataResult.start_date_before) {
        validateDataResult.start_date_before = validateDataResult.start_date_before.format(config.date_format.dd_mm_yyyy);
    }
    if(!!validateDataResult.end_date_option) {
        validateDataResult.end_date_option = validateDataResult.end_date_option.format(config.date_format.dd_mm_yyyy);
    }
    if(!!validateDataResult.start_date_after) {
        validateDataResult.start_date_after = validateDataResult.start_date_after.format(config.date_format.dd_mm_yyyy);
    }
    config.response(res, validateDataResult, config.httpStatus.success, req.__('staff_positions.checkData.success'))
}

/**
 * Service update staff position
 * @param {*} req 
 * @param {*} res 
 */
async function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StaffPositions.findOne(
            {
                where: {
                    id: body.id,
                    is_active: config.active.true
                },
                raw: true
            }).then(async result => {
                if (!result) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('staff_positions.update.not_found_staff_position'));
                    return;
                }

                // Validate data
                if(body.start_date) {
                    body.action = body.action ? body.action : result.action
                }
                const validateDataResult = await validateData(body);
                if(validateDataResult.status == 'error') {
                    config.response(res, validateDataResult, config.httpStatus.badRequest, req.__('staff_positions.checkData.failed'));
                } 
                // update value result
                for(let key of Object.keys(result)) {
                    if(!!body[key] || body[key] == null || body[key] == '') {
                        if(body[key] == '') result[key] = null;
                        else result[key] = body[key];
                    }
                }
                // get position id
                if(!body.job_position && !!body.dept_id || !!body.job_position && !body.dept_id) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('staff_positions.update.job_position_or_dept_id_invalid'));
                } else if(!!body.job_position && !!body.dept_id) {
                    await db.db.Positions.findOne({
                        where: {
                            job_position: body.job_position,
                            dept_id: body.dept_id,
                            is_active: config.active.true
                        },
                        raw: true,
                    }).then(resultPosition => {
                        if (!resultPosition) {
                            config.response(res, null, config.httpStatus.badRequest, req.__('staff_positions.update.not_found_positions'));
                            return;
                        }
                        result.position_id = resultPosition.id
                    }).catch(error => {
                        config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.update.find_position_failed'));
                    })
                }
                // update record staff position
                config.audit(result, req, true);
                db.db.StaffPositions.update(result,{
                        where: { id: body.id },
                    }).then(updated => {
                        // Update end_date before record 
                        if(validateDataResult.status == 'option') {
                            const staff_position_before = validateDataResult.staff_position_before;
                            staff_position_before.end_date = validateDataResult.end_date_option.format(config.date_format.yyyy_mm_dd);
                            updateEndDateBeforeRecord(req, res, staff_position_before);
                        }

                        config.response(res, result, config.httpStatus.success, req.__('staff_positions.update.success'));
                    }).catch(error => {
                        config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.update.failed'));
                    });
            }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_positions.update.find_staff_position_failed'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('staff_positions.update.failed'));
    }
}

/**
 * Service delete staff position
 * @param {*} req 
 * @param {*} res 
 */
async function deletePosition(req, res) {
    let id = req.params['id'];

    db.db.StaffPositions.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: id}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('staff_positions.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('staff_positions.delete.failed'));
    })
}

/**
 * Service export template staff position
 * @param {*} req 
 * @param {*} res 
 */
async function exportTemplate(req, res) {
    const wb = new Excel.Workbook();
    const path2 = '/templates/qua_trinh_cong_tac.xlsx';
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + path2
    );

    wb.xlsx.readFile(path.dirname(__dirname) + path2)
    .then(async () => {
        let sheet = wb.worksheets[1];

        /** Get list dict item for action, reason, reason_detail  */
        let action = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.BIEN_DONG, null);
        // let reason = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NHOM_LY_DO_BIEN_DONG, null);
        // let reason_detail = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.LY_DO_BIEN_DONG_CHI_TIET, null);

        let actions = [];
        // let reasons = [];
        // let reasons_detail = [];
        if(!!action && action.length > 0) {
            actions = await dictItemRepo.findByDictTypeId(action[0].id, null);
        }
        // if(reason.length > 0) {
        //     reasons = await dictItemRepo.findByDictTypeId(reason[0].id, null);
        // }
        // if(reason_detail.length > 0) {
        //     reasons_detail = await dictItemRepo.findByDictTypeId(reason_detail[0].id, null);
        // }

        /** Get list dict item for job_position and position_name */
        let jobPosition = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.VI_TRI_CONG_VIEC, null);
        let positionName = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUC_DANH, null);

        let jobPositions = [];
        let positionNames = [];
        if (!!jobPosition && jobPosition.length > 0) {
            jobPositions = await dictItemRepo.findByDictTypeId(jobPosition[0].id, null);
        }
        if (!!positionName && positionName.length > 0) {
            positionNames = await dictItemRepo.findByDictTypeId(positionName[0].id, null);
        }
        
        // write refer
        config.writeRefer(sheet, actions, staff_positions_dto.staff_positions_refer.action);
        config.writeRefer(sheet, positionNames, staff_positions_dto.staff_positions_refer.position_name);
        config.writeRefer(sheet, jobPositions, staff_positions_dto.staff_positions_refer.job_position);

        wb.xlsx.write(res);
    })
    .catch(error => {
        console.error(error);
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    });
}

/**
 * Service export data staff positions
 * @param {*} req 
 * @param {*} res 
 */
async function exportExcel(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/qua_trinh_cong_tac.xlsx';
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + path2
    );

    const searchObj = {
        name: req.body['name'],
        staff_code: req.body['staff_id'],
        time: req.body['time'],
        action: req.body['action'],
        action_type: req.body['action_type'],
        staff_title: req.body['title'], //chuc danh
        job_position: req.body['job_position'],   //vi tri cong viec
        dept_id: req.body['dept_id'], //don vi
        excel: true
    }

    wb.xlsx.readFile(path.dirname(__dirname) + path2)
    .then(async () => {
        let sheet = wb.worksheets[0];
        let startIndex = staff_positions_dto.start_index;

        let datas = []
        if(!!body.list_category_id && body.list_category_id.length > 0) {
            datas = await staffPositionsRepo.findByListCategory(body.list_category_id);
        } else {
            datas = await search(searchObj, false, true);
        }

        let index = 1;
        for(let data of datas) {
            if(!!data.departments && data.departments.length > 0) {
                for(let c = 0; c < data.departments.length; c++) {
                    data[`unit_${c}`] = data.departments[data.departments.length - c - 1].dep_name;
                }
            }

            data.name_position = data.naming;
            data.job_position_name = data.work_position;

            let insert = [index];
            for (let c = 1; c < staff_positions_dto.mapping.length; c++) {
                insert.push(data[staff_positions_dto.mapping[c].field]);
            }
            sheet.insertRow(startIndex + index - 1, insert);
            index++;
        }

        wb.xlsx.write(res);
    })
    .catch(error => {
        console.error(error);
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    });
}

/**
 * Service import data staff positions
 * @param {*} req 
 * @param {*} res 
 */
async function importExcel(req, res) {
    config.importExcel(req, res, true, staff_positions_dto, async (datas, flags, resultObj) => {

        let created = [];
        let updated = [];

        // Get list dict item for action, reason, reason_detail
        let action = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.BIEN_DONG, null);
        let reason = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NHOM_LY_DO_BIEN_DONG, null);
        let reason_detail = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.LY_DO_BIEN_DONG_CHI_TIET, null);

        let actions = [];
        let reasons = [];
        let reasons_detail = [];
        if(!!action && action.length > 0) {
            actions = await dictItemRepo.findByDictTypeId(action[0].id, null);
        }
        if(!!reason && reason.length > 0) {
            reasons = await dictItemRepo.findByDictTypeId(reason[0].id, null);
        }
        if(!!reason_detail && reason_detail.length > 0) {
            reasons_detail = await dictItemRepo.findByDictTypeId(reason_detail[0].id, null);
        }

        // Get list dict item for job_position and position_name
        let jobPosition = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.VI_TRI_CONG_VIEC, null);
        let positionName = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUC_DANH, null);

        let jobPositions = [];
        let positionNames = [];
        if (!!jobPosition && jobPosition.length > 0) {
            jobPositions = await dictItemRepo.findByDictTypeId(jobPosition[0].id, null);
        }
        if (!!positionName && positionName.length > 0) {
            positionNames = await dictItemRepo.findByDictTypeId(positionName[0].id, null);
        }

        // Get list id job_position in array
        let jobPositionsIds = datas.map(x => {
            if(x['job_position_name']) {
                let c = jobPositions.find(y => y.dict_name.toLowerCase() === x['job_position_name'].toLowerCase());
                if(c) {
                    return c.id;
                }
            }
        })

        jobPositionsIds = jobPositionsIds.filter(function (x, i, a) {
            return a.indexOf(x) == i;
        });
        
        let corePositions = await corePositionsRepo.searchByJobPosition(jobPositionsIds);

        // Get list unit
        let unit_0s = await departmentRepo.findByLevel(0);
        let unit_1s = await departmentRepo.findByLevel(1);
        let unit_2s = await departmentRepo.findByLevel(2);
        let unit_3s = await departmentRepo.findByLevel(3);
        let unit_4s = await departmentRepo.findByLevel(4);
        let unit_5s = await departmentRepo.findByLevel(5);

        for (let i = 0; i < datas.length; i++) {
            // Data processing
            let data = datas[i];

            // Ma nhan vien
            let staff;
            if(data.staff_code) {
                staff = await staffRepo.findByStaffId(data.staff_code);
                if(staff.length > 0) {
                    data.staff_id = staff[0].id;
                } else {
                    data.result = req.__('cert.staff_id.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('cert.staff_id.empty');
                resultObj.totalError++;
                continue;
            }

            let unit_level = -1;
            /** don vi cap 0 **/
            if(!data.unit_0) {
                data.result = req.__('position.unit_0.empty');
                resultObj.totalError++;
                continue;
            } else {
                let c = unit_0s.find(x => x.dep_name.toLowerCase() === data.unit_0.toLowerCase());
                if(!c) {
                    data.result = req.__('position.unit_0.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_0_id = c;
                    unit_level = 0;
                }
            }

            /** don vi cap 1 **/
            if(data.unit_1) {
                if(unit_level !== 0) {
                    data.result = req.__('position.unit.not_full');
                    resultObj.totalError++;
                    continue
                }
                let c = unit_1s.find(
                    x => x.dep_name.toLowerCase() === data.unit_1.toLowerCase() &&
                        x.parent_id == data.unit_0_id.id );
                if(!c) {
                    data.result = req.__('position.unit_1.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_1_id = c;
                    unit_level = 1;
                }
            }

            /** don vi cap 2 **/
            if(data.unit_2) {
                if(unit_level !== 1) {
                    data.result = req.__('position.unit.not_full');
                    resultObj.totalError++;
                    continue
                }
                let c = unit_2s.find(
                    x => x.dep_name.toLowerCase() === data.unit_2.toLowerCase() &&
                        x.parent_id == data.unit_1_id.id );
                if(!c) {
                    data.result = req.__('position.unit_2.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_2_id = c;
                    unit_level = 2;
                }
            }
            /** don vi cap 3 **/
            if(data.unit_3) {
                if(unit_level !== 2) {
                    data.result = req.__('position.unit.not_full');
                    resultObj.totalError++;
                    continue
                }
                let c = unit_3s.find(
                    x => x.dep_name.toLowerCase() === data.unit_3.toLowerCase() &&
                        x.parent_id == data.unit_2_id.id );
                if(!c) {
                    data.result = req.__('position.unit_3.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_3_id = c;
                    unit_level = 3;
                }
            }

            /** don vi cap 4 **/
            if(data.unit_4) {
                if(unit_level !== 3) {
                    data.result = req.__('position.unit.not_full');
                    resultObj.totalError++;
                    continue
                }
                let c = unit_4s.find(
                    x => x.dep_name.toLowerCase() === data.unit_4.toLowerCase() &&
                        x.parent_id == data.unit_3_id.id );
                if(!c) {
                    data.result = req.__('position.unit_4.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_4_id = c;
                    unit_level = 4;
                }
            }

            /** don vi cap 5 **/
            if(data.unit_5 ) {
                if(unit_level !== 4) {
                    data.result = req.__('position.unit.not_full');
                    resultObj.totalError++;
                    continue
                }
                let c = unit_5s.find(
                    x => x.dep_name.toLowerCase() === data.unit_5.toLowerCase() &&
                        x.parent_id == data.unit_4_id.id );
                if(!c) {
                    data.result = req.__('position.unit_5.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.unit_5_id = c;
                    unit_level = 5;
                }
            }

            if(unit_level === 5) {
                data.dept_id = data.unit_5_id.id;
            }
            if(unit_level === 4) {
                data.dept_id = data.unit_4_id.id;
            }
            if(unit_level === 3) {
                data.dept_id = data.unit_3_id.id;
            }
            if(unit_level === 2) {
                data.dept_id = data.unit_2_id.id;
            }
            if(unit_level === 1) {
                data.dept_id = data.unit_1_id.id;
            }
            if(unit_level === 0) {
                data.dept_id = data.unit_0_id.id;
            }

            // Chuc danh
            if(data.name_position) {
                let c = positionNames.find(x => x.dict_name.toLowerCase() === data.name_position.toLowerCase());
                if(!c) {
                    data.result = req.__('position.name_position.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.name_position_obj = c;
                }
            } else {
                data.result = req.__('position.name_position.empty');
                resultObj.totalError++;
                continue;
            }

            // Vi tri cong viec 
            if(data.job_position_name) {
                let c = jobPositions.find(x => x.dict_name.toLowerCase() === data.job_position_name.toLowerCase() &&
                    (data.name_position_obj && x.parent_id === data.name_position_obj.id));
                if(!c) {
                    data.result = req.__('position.job_position.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    let d = corePositions.find(x => x.job_position === c.id && x.dept_id === data.dept_id);
                    if(d) {
                        data.position_id = d.id;
                    }
                }
            } else {
                data.result = req.__('position.job_position.empty');
                resultObj.totalError++;
                continue;
            }

            // Bien dong
            if(data.action_name) {
                let c = actions.find(x => x.dict_name.toLowerCase() === data.action_name.toLowerCase());
                if(!c) {
                    data.result = req.__('actions.action_name.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.action = c.id;
                    data.action_name_obj = c;
                }
            } else {
                data.result = req.__('actions.action_name.empty');
                resultObj.totalError++;
                continue;
            }

            // Ly do
            if(data.reason_name) {
                let c = reasons.find(x => x.dict_name.toLowerCase() === data.reason_name.toLowerCase() &&
                    (data.action_name_obj && x.parent_id === data.action_name_obj.id));
                if(!c) {
                    data.result = req.__('actions.reason_name.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.reason = c.id;
                    data.reasons_name_obj = c;
                }
            } else {
                data.result = req.__('actions.reason_name.empty');
                resultObj.totalError++;
                continue;
            }

            // Ly do chi tiet
            if(data.reason_detail_name) {
                let c = reasons_detail.find(x => x.dict_name.toLowerCase() === data.reason_detail_name.toLowerCase() &&
                    (data.reasons_name_obj && x.parent_id === data.reasons_name_obj.id));
                if(!c) {
                    data.result = req.__('actions.reason_detail_name.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.reason_detail = c.id;
                }
            } else {
                data.result = req.__('actions.reason_detail_name.empty');
                resultObj.totalError++;
                continue;
            }

            let entity = config.clone(data);
            if (data.system_code) {
                let existed = await staffPositionsRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;
                    config.audit(entity, req, true);
                    updated.push(entity);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.staff_positions_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.staff_positions + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;
        }

        if (created.length > 0) {
            await db.db.StaffPositions.bulkCreate(
                created,
                {
                    fields: staff_positions_dto.fields,
                    updateOnDuplicate: staff_positions_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.StaffPositions.upsert(entity);
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    })
}

function getMainPosition(staffId) {
    return StaffPositions.findAll({
        where: {
            staff_id: staffId,
            roles: 1
        }
    });
}

function findTreeByStaffId(staffId) {

}

module.exports = {
    findAll: findAll,
    create: create,
    checkData: checkData,
    update: update,
    deletePosition: deletePosition,
    exportTemplate: exportTemplate,
    exportExcel: exportExcel,
    importExcel: importExcel,
    getMainPosition: getMainPosition,
}
