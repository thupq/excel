const db = require("../config/database-config");
let strategicStaffingRepo = require('../model/repositories/strategic_staffing.custom');
let config = require('../config');
const {now} = require("moment");
let departmentRepo = require('../model/repositories/department.custom');
const dictTypeRepo = require('../model/repositories/dict_types.custom');
const dictItemRepo = require('../model/repositories/dict_items.custom');
const moment = require('moment');
const strategic_staffing_dto = require('../model/dto/strategic_staffing_import.dto');
const corePositionsRepo = require('../model/repositories/core_positions.custom');
const Excel = require('exceljs');
const path = require('path');

async function processData(datas) {
    let glone = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGACH, null);
    let level = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CAP_BAC, null);
    let glones = [];
    let levels = [];

    if (glone.length > 0) {
        glones = await dictItemRepo.findByDictTypeId(glone[0].id, null);
    }
    if (level.length > 0) {
        levels = await dictItemRepo.findByDictTypeId(level[0].id, null);
    }

    for (let data of datas) {
        if (data.dept_id) {
            data.departments = await departmentRepo.findTreeDepartmentByDeptd(data.dept_id);
        }

        if (data.effective_date) {
            data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
        }
        if (data.expired_date) {
            data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
        }
        let totalEmp = await strategicStaffingRepo.totalEmployeeCurrent(data.dept_id, data.job_position);
        if(totalEmp.length > 0) {
            data.totalEmp = Number(totalEmp[0].count);
        } else {
            data.totalEmp = 0;
        }
        // ngach
        if (data.glone) {
            let c = glones.find(x => x.id == data.glone);
            if (c) {
                data.glone_str = c.dict_name;
            } else {
                data.glone_str = ''
            }
        } else {
            data.glone_str = ''
        }

        // cấp bậc
        if (data.level) {
            let c = levels.find(x => x.id == data.level);
            if (c) {
                data.level_str = c.dict_name;
            } else {
                data.level_str = ''
            }
        } else {
            data.level_str = ''
        }
    }
    return datas;
}

async function findAll(req, res) {
    const searchObj = {
        time_working: req.body['timeWorking'],
        core_position_id: req.body['jobPosition'],   //vi tri cong viec
        core_department_id: req.body['deptId'], //don vi
        name_position_id: req.body['namePosition'],   //chuc danh
        page: req.body['page'],
        size: req.body['size']
    }

    let count = await strategicStaffingRepo.findAll(searchObj,true, true);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await strategicStaffingRepo.findAll(searchObj, false, false);
    if(datas.length > 0) {

        datas = await processData(datas);
    }

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));

}

async function searchExcel(searchObj) {

    let datas = await strategicStaffingRepo.findAll(searchObj, false, true);
    if(datas.length > 0) {

        datas = await processData(datas);
    }
    return datas;
}

async function create(req, res) {
    let body = req.body;
    body.is_active = config.active.true;
    config.audit(body, req, false);

    let id = await db.getNextSequence(config.sequence.stategic_staffing_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.stategic_staffing + id;

    let strategicStaffCurrent = await strategicStaffingRepo.strategicStaffCurrentWithPosition(body.dept_id, body.position_id);

    db.db.Positions.findOne(
        {
            where: {
                job_position: body.position_id,
                dept_id: body.dept_id,
            },
            raw: true
        }).then(result => {
            if (!result) {
                config.response(res, result, config.httpStatus.badRequest, req.__('strategic_staffing.not_found.position'));
            }

            body.position_id = result.id;
            db.db.StrategicStaffing.create(body).then(result => {
                if (strategicStaffCurrent) {
                    // cập nhật thời gian bắt đầu của định biên mới thành thời gian kết thúc của định biên cũ nếu tồn tại định biên
                    for(let strategic of strategicStaffCurrent) {
                        if (strategic.id) {
                            db.db.StrategicStaffing.findOne(
                                {
                                    where: {
                                        id: strategic.id
                                    },
                                    raw: true
                                }).then(result => {
                                result.end_date = body.start_date;
                                config.audit(result, req, true);
                                db.db.StrategicStaffing.update(result,
                                    {
                                        where: { id: strategic.id },
                                    })
                                    .then(updated => {
                                        console.log(updated)
                                    }).catch(error => {
                                    console.log(error)
                                });
                            })
                                .catch(error => {
                                    console.log(error)
                                });
                        }
                    }
                }

                config.response(res, result, config.httpStatus.success, req.__('strategic_staffing.created.success'));
            }).catch(error => {
                config.logError(error, req);
                config.response(res, error, config.httpStatus.badRequest, req.__('strategic_staffing.created.failed'));
            });
        })
        .catch(error => {
            console.log(error)
            config.response(res, error, config.httpStatus.badRequest, req.__('strategic_staffing.created.failed'));
        });

}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StrategicStaffing.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(async result => {
                if (!result) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('strategic_staffing.update.not_found'));
                    return;
                }

                // update value result
                for(let key of Object.keys(result)) {
                    if(!!body[key] || body[key] == null || body[key] == '') {
                        result[key] = body[key];
                    }
                }

                // get position id
                if(!body.job_position && !!body.dept_id || !!body.job_position && !body.dept_id) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('strategic_staffing.update.job_position_or_dept_id_invalid'));
                } else if(!!body.job_position && !!body.dept_id) {
                    await db.db.Positions.findOne({
                        where: {
                            job_position: body.job_position,
                            dept_id: body.dept_id,
                        },
                        raw: true,
                    }).then(resultPosition => {
                        if (!resultPosition) {
                            config.response(res, null, config.httpStatus.badRequest, req.__('strategic_staffing.update.not_found_positions'));
                            return;
                        }
                        result.position_id = resultPosition.id
                    }).catch(error => {
                        config.response(res, error, config.httpStatus.badRequest, req.__('strategic_staffing.update.find_position_failed'));
                    })
                }
                
                db.db.StrategicStaffing.update(result,
                    {
                        where: { id: id },
                    })
                    .then(updated => {
                        config.response(res, result, config.httpStatus.success, req.__('strategic_staffing.update.success'));
                    }).catch(error => {
                    config.response(res, error, config.httpStatus.badRequest, req.__('strategic_staffing.update.fail'));
                });
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('strategic_staffing.update.fail'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('strategic_staffing.update.fail'));
    }
}

function deleteStrategicStaffing(req, res) {
    let body = req.body
    let ids = body.ids


    db.db.StrategicStaffing.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: ids}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('strategic_staffing.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('strategic_staffing.delete.fail'));
    })


}

async function numberEmployeeCurrent(req, res) {
    const dept_id = req.body.dept_id;
    const job_position = req.body.job_position;
    if (dept_id && job_position) {
        let strategicStaffCurrent = await strategicStaffingRepo.totalEmployeeCurrent(dept_id, job_position);

        if (strategicStaffCurrent) {
            config.response(res, strategicStaffCurrent, config.httpStatus.success, req.__('system.success'));
        } else {
            config.response(res, error, config.httpStatus.success, req.__('system.error'));
        }
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    }
}

function exportTemplate(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/dinh_bien.xlsx';
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
        // let unit_0 = await namingSystemRepo.findByLevel(0);
        // let unit_1 = await namingSystemRepo.findByLevel(1);
        // let unit_2 = await namingSystemRepo.findByLevel(2);
        // let unit_3 = await namingSystemRepo.findByLevel(3);
        // let unit_4 = await namingSystemRepo.findByLevel(4);

        let glone = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGACH, null);
        let level = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CAP_BAC, null);
        let jobPosition = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.VI_TRI_CONG_VIEC, null);
        let positionName = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUC_DANH, null);

        let glones = [];
        let levels = [];
        let jobPositions = [];
        let positionNames = [];
        if (!!glone && glone.length > 0) {
            glones = await dictItemRepo.findByDictTypeId(glone[0].id, null);
        }
        if (!!level && level.length > 0) {
            levels = await dictItemRepo.findByDictTypeId(level[0].id, null);
        }
        if (!!jobPosition && jobPosition.length > 0) {
            jobPositions = await dictItemRepo.findByDictTypeId(jobPosition[0].id, null);
        }
        if (!!positionName && positionName.length > 0) {
            positionNames = await dictItemRepo.findByDictTypeId(positionName[0].id, null);
        }
        config.writeRefer(sheet, positionNames, strategic_staffing_dto.strate_refer.position_name);
        config.writeRefer(sheet, jobPositions, strategic_staffing_dto.strate_refer.job_position);
        config.writeRefer(sheet, glones, strategic_staffing_dto.strate_refer.glone);
        config.writeRefer(sheet, levels, strategic_staffing_dto.strate_refer.level);
        wb.xlsx.write(res);
    })
    .catch(error => {
        console.error(error);
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    });
}

function exportExcel(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/dinh_bien.xlsx';
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + path2
    );

    const searchObj = {
        time_working: req.body['timeWorking'],
        core_position_id: req.body['jobPosition'],   //vi tri cong viec
        name_position_id: req.body['namePosition'],   //chuc danh
        core_department_id: req.body['deptId'], //don vi
        excel: true
    }

    wb.xlsx.readFile(path.dirname(__dirname) + path2)
    .then(async () => {
        let sheet = wb.worksheets[0];
        let startIndex = strategic_staffing_dto.start_index;
        let datas = [];
        if(body.list_category_id.length > 0) {
            datas = await strategicStaffingRepo.searchByListCategory(body.list_category_id);

        } else {
            datas = await searchExcel(searchObj);
        }

        if(datas.length > 0 ) {
            datas = await processData(datas);
        }
        let index = 1;
        console.log(datas);
        for(let data of datas) {
            if(data.departments.length > 0) {
                for(let c = 0; c < data.departments.length; c++) {
                    data[`unit_${c}`] = data.departments[data.departments.length - c - 1].dep_name;
                }
            }

            data.name_position = data.naming;
            data.job_position_str = data.work_position;
            if(data.start_date) {
                data['start_date_str'] = moment(data['start_date']).format('DD/MM/YYYY');
            }
            if(data.end_date) {
                data['end_date_str'] = moment(data['end_date']).format('DD/MM/YYYY');
            }

            let insert = [index];
            for (let c = 1; c < strategic_staffing_dto.mapping.length; c++) {
                insert.push(data[strategic_staffing_dto.mapping[c].field]);
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

function importExcel(req, res) {
    config.importExcel(req, res, true, strategic_staffing_dto, async (datas, flags, resultObj) => {

        let created = [];
        let updated = [];

        let glone = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGACH, null);
        let level = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CAP_BAC, null);
        let jobPosition = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.VI_TRI_CONG_VIEC, null);
        let positionName = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUC_DANH, null);

        let glones = [];
        let levels = [];
        let jobPositions = [];
        let positionNames = [];
        if (!!glone && glone.length > 0) {
            glones = await dictItemRepo.findByDictTypeId(glone[0].id, null);
        }
        if (!!level && level.length > 0) {
            levels = await dictItemRepo.findByDictTypeId(level[0].id, null);
        }
        if (!!jobPosition && jobPosition.length > 0) {
            jobPositions = await dictItemRepo.findByDictTypeId(jobPosition[0].id, null);
        }
        if (!!positionName && positionName.length > 0) {
            positionNames = await dictItemRepo.findByDictTypeId(positionName[0].id, null);
        }

        /** lay tat ca vi tri cong viec **/
        let jobPositionsIds = datas.map(x => {
            if(x['job_position_str']) {
                let c = jobPositions.find(y => y.dict_name.toLowerCase() === x['job_position_str'].toLowerCase());
                if(c) {
                    return c.id;
                }
            }
        })

        jobPositionsIds = jobPositionsIds.filter(function (x, i, a) {
            return a.indexOf(x) == i;
        });

        let unit_0s = await departmentRepo.findByLevel(0);
        let unit_1s = await departmentRepo.findByLevel(1);
        let unit_2s = await departmentRepo.findByLevel(2);
        let unit_3s = await departmentRepo.findByLevel(3);
        let unit_4s = await departmentRepo.findByLevel(4);
        let unit_5s = await departmentRepo.findByLevel(5);

        let corePositions = await corePositionsRepo.searchByJobPosition(jobPositionsIds);
        // console.log(jobPositionsIds);
        // console.log(corePositions);
        // return ;

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];


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

            /** chuc danh **/
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

            /** vi tri cong viec **/
            if(data.job_position_str) {
                let c = jobPositions.find(x => x.dict_name.toLowerCase() === data.job_position_str.toLowerCase() &&
                    (data.name_position_obj && x.parent_id === data.name_position_obj.id));
                if(!c) {
                    data.result = req.__('position.job_position.not_found');
                    resultObj.totalError++;
                    continue;
                } else {

                    let d = corePositions.find(x => x.job_position === c.id && x.dept_id === data.dept_id);
                    if(d) {
                        data.position_id = d.id;
                    } else {
                      data.result = req.__('position.job_position.not_found');
                      resultObj.totalError++;
                      continue;
                    }
                }
            } else {
                data.result = req.__('position.job_position.empty');
                resultObj.totalError++;
                continue;
            }

            /** dinh bien **/
            if(data.strategy) {
                if(!config.checkPattern(data.strategy, config.pattern.decimal)) {
                    data.result = req.__('strategy.strategy.format_error');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('strategy.strategy.empty');
                resultObj.totalError++;
                continue;
            }

            if(data.start_date_str) {
                if(!config.checkPattern(data.start_date_str, config.pattern.dd_mm_yyyy)) {
                    data.result = req.__('strategy.start_date.error_format');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.start_date = moment(data.start_date_str, 'DD/MM/YYYY').format("MM/DD/YYYY");
                }
            } else {
                data.result = req.__('strategy.start_date.empty');
                resultObj.totalError++;
                continue;
            }

            if(data.end_date_str) {
                if(!config.checkPattern(data.end_date_str, config.pattern.dd_mm_yyyy)) {
                    data.result = req.__('strategy.end_date.error_format');
                    resultObj.totalError++;
                    continue;
                } else {

                    if(!config.isLessThan(data.start_date_str, data.end_date_str)) {
                        data.result = req.__('position.expired_date.lessThan');
                        resultObj.totalError++;
                        continue;
                    }
                    data.end_date = moment(data.end_date_str, 'DD/MM/YYYY').format("MM/DD/YYYY");
                }
            } else {
                data.expired_date = null;
            }

            let entity = config.clone(data);
            if (data.system_code) {
                let existed = await strategicStaffingRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;
                    /** update by flags **/
                    config.updateFlags(existed[0], entity, flags, strategic_staffing_dto);
                    config.audit(existed[0], req, true);
                    updated.push(existed[0]);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.stategic_staffing_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.stategic_staffing + id;
                config.audit(entity, req, false);
                created.push(entity);

                /** update lai dinh bien **/
                await strategicStaffingRepo.updateLastStrategic(data.dept_id, data.position_id, data.start_date_str)

            }
            entity.is_active = config.active.true;
        }

        if (created.length > 0) {
            await db.db.StrategicStaffing.bulkCreate(
                created,
                {
                    fields: strategic_staffing_dto.fields,
                    updateOnDuplicate: strategic_staffing_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.StrategicStaffing.upsert(entity);
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}


module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteStrategicStaffing: deleteStrategicStaffing,
    numberEmployeeCurrent: numberEmployeeCurrent,
    exportExcel: exportExcel,
    importExcel: importExcel,
    exportTemplate: exportTemplate
}
