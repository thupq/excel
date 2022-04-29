const db = require("../config/database-config");
let corePositionsRepo = require('../model/repositories/core_positions.custom');
let config = require('../config');
const Excel = require('exceljs');
const path = require('path');
const {now} = require("moment");
const dictTypeRepo = require('../model/repositories/dict_types.custom');
const dictItemRepo = require('../model/repositories/dict_items.custom');
let departmentRepo = require('../model/repositories/department.custom');
const moment = require('moment');
const core_positions_dto = require('../model/dto/core_positions_import.dto');

async function findAll(req, res) {

    const searchObj = {
        time_working: req.body['timeWorking'],
        core_position_id: req.body['jobPosition'],   //vi tri cong viec
        name_position_id: req.body['namePosition'],   //chuc danh
        core_department_id: req.body['deptId'], //don vi
        page: req.body['page'],
        size: req.body['size'],
    }
    let count = await corePositionsRepo.findAll(searchObj,true, );
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await findBySearch(searchObj);

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));

}

async function findBySearch(searchObj) {
    let datas = await corePositionsRepo.findAll(searchObj,false, );
    if(datas.length > 0) {

        datas = await processData(datas);
    }
    return datas;
}

async function create(req, res) {
    let body = req.body;
    body.is_active = config.active.true;
    config.audit(body, req, false);
    let id = await db.getNextSequence(config.sequence.core_positions_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.core_positions + id;

    db.db.CorePositions.upsert(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('naming_system.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('naming_system.created.failed'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        db.db.CorePositions.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('naming_system.update.not_found'));
                return;
            }
            // delete result.id
            result.dept_id = body.dept_id;
            result.job_position = body.job_position;
            result.glone = body.glone;
            result.level = body.level;
            result.coefficients_salary = body.coefficients_salary;
            result.effective_date = body.effective_date;
            result.expired_date = body.expired_date;
            config.audit(result, req, true);
            db.db.CorePositions.update(result,
                {
                    where: { id: id },
                })
                .then(updated => {
                    config.response(res, result, config.httpStatus.success, req.__('naming_system.update.success'));
                }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('naming_system.update.fail'));
            });
        })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('naming_system.update.fail'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('naming_system.update.fail'));
    }
}

function deleteNamingSystem(req, res) {
    let body = req.body
    let ids = body.ids


    db.db.CorePositions.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: ids}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('naming_system.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('naming_system.delete.fail'));
    })


}

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

    for(let data of datas) {
        if (data.dept_id) {
            data.departments = await departmentRepo.findTreeDepartmentByDeptd(data.dept_id);
        }

        if (data.effective_date) {
            data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
        }
        if (data.expired_date) {
            data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
        }

        // ngach
        if (data.glone) {
            let c = glones.find(x => x.id == data.glone);
            if (c) {
                data.glone_str = c.dict_name;
            }
        }

        // cấp bậc
        if (data.level) {
            let c = levels.find(x => x.id == data.level);
            if (c) {
                data.level_str = c.dict_name;
            }
        }
    }
    return datas;
}

async function exportExcel(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/he_thong_chuc_danh.xlsx';
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
        let startIndex = core_positions_dto.start_index;
        let datas = [];
        if(body.list_category_id.length > 0) {
            datas = await corePositionsRepo.searchByListCategory(body.list_category_id);

        } else {
            datas = await findBySearch(searchObj);
        }

        if(datas.length > 0 ) {
            datas = await processData(datas);
        }
        let index = 1;
        for(let data of datas) {
            if(data.departments.length > 0) {
                for(let c = 0; c < data.departments.length; c++) {
                    data[`unit_${c}`] = data.departments[data.departments.length - c - 1].dep_name;
                }
            }

            data.name_position = data.naming;
            data.job_position_str = data.work_position;

            if (data.effective_date) {
                data.effective_date_str = data.effective_date;//moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
            }
            if (data.expired_date) {
                data.expired_date_str = data.expired_date;//moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
            }


            let insert = [index];
            for (let c = 1; c < core_positions_dto.mapping.length; c++) {
                insert.push(data[core_positions_dto.mapping[c].field]);
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

function exportTemplate(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/he_thong_chuc_danh.xlsx';
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
        config.writeRefer(sheet, positionNames, core_positions_dto.pos_refer.position_name);
        config.writeRefer(sheet, jobPositions, core_positions_dto.pos_refer.job_position);
        config.writeRefer(sheet, glones, core_positions_dto.pos_refer.glone);
        config.writeRefer(sheet, levels, core_positions_dto.pos_refer.level);
        wb.xlsx.write(res);
    })
    .catch(error => {
        console.error(error);
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    });
}

function importExcel(req, res) {
    config.importExcel(req, res, true, core_positions_dto, async (datas, flags, resultObj) => {

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
        if (glone.length > 0) {
            glones = await dictItemRepo.findByDictTypeId(glone[0].id, null);
        }
        if (level.length > 0) {
            levels = await dictItemRepo.findByDictTypeId(level[0].id, null);
        }
        if (jobPosition.length > 0) {
            jobPositions = await dictItemRepo.findByDictTypeId(jobPosition[0].id, null);
        }
        if (positionName.length > 0) {
            positionNames = await dictItemRepo.findByDictTypeId(positionName[0].id, null);
        }

        let unit_0s = await departmentRepo.findByLevel(0);
        let unit_1s = await departmentRepo.findByLevel(1);
        let unit_2s = await departmentRepo.findByLevel(2);
        let unit_3s = await departmentRepo.findByLevel(3);
        let unit_4s = await departmentRepo.findByLevel(4);
        let unit_5s = await departmentRepo.findByLevel(5);

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
                    data.result = req.__('position.unit_4.not_found');
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
                    data.job_position = c.id;
                }
            } else {
                data.result = req.__('position.job_position.empty');
                resultObj.totalError++;
                continue;
            }

            /** ngạch **/
            if(data.glone_str) {
                let c = glones.find(x => x.dict_name.toLowerCase() === data.glone_str.toLowerCase());
                if(!c) {
                    data.result = req.__('position.glone_str.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.glone = c.id;
                }
            } else {
                data.result = req.__('position.glone_str.empty');
                resultObj.totalError++;
                continue;
            }

            /** cap bac **/
            if(data.level_str) {
                let c = levels.find(x => x.dict_name.toLowerCase() === data.level_str.toLowerCase());
                if(!c) {
                    data.result = req.__('position.level_str.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.level = c.id;
                }
            } else {
                data.result = req.__('position.level_str.empty');
                resultObj.totalError++;
                continue;
            }

            /** he so luong **/
            if(data.coefficients_salary) {
                if(!config.checkPattern(data.coefficients_salary, config.pattern.decimal)) {
                    data.result = req.__('position.coefficients_salary.error');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.coefficients_salary = null;
            }

            if(data.effective_date_str) {
                if(!config.checkPattern(data.effective_date_str, config.pattern.dd_mm_yyyy)) {
                    data.result = req.__('position.effective_date.error_format');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.effective_date = moment(data.effective_date_str, 'DD/MM/YYYY').format("MM/DD/YYYY");
                }

            } else {
                data.result = req.__('position.effective_date.empty');
                resultObj.totalError++;
                continue;
            }

            if(data.expired_date_str) {
                if(!config.checkPattern(data.expired_date_str, config.pattern.dd_mm_yyyy)) {
                    data.result = req.__('position.expired_date.error_format');
                    resultObj.totalError++;
                    continue;
                }else {
                    data.expired_date = moment(data.expired_date_str, 'DD/MM/YYYY').format("MM/DD/YYYY");
                }

                if(!config.isLessThan(data.effective_date_str, data.expired_date_str)) {
                    data.result = req.__('position.expired_date.lessThan');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.expired_date = null;
            }

            let entity = config.clone(data);
            if (data.system_code) {
                let existed = await corePositionsRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;
                    /** update by flags **/
                    config.updateFlags(existed[0], entity, flags, core_positions_dto);
                    config.audit(existed[0], req, true);
                    updated.push(existed[0]);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.core_positions_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.core_positions + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;
        }

        if (created.length > 0) {
            await db.db.CorePositions.bulkCreate(
                created,
                {
                    fields: core_positions_dto.fields,
                    updateOnDuplicate: core_positions_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.CorePositions.upsert(entity);
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
    deleteNamingSystem: deleteNamingSystem,
    exportExcel: exportExcel,
    exportTemplate: exportTemplate,
    importExcel: importExcel

}
