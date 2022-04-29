const db = require("../config/database-config");
const config = require('../config');
const {now} = require("moment");
const Excel = require('exceljs');
const path = require('path');
const moment = require('moment');
const rewardAndDisciplineRepo = require('../model/repositories/reward_and_discipline.custom');
const dictTypeRepo = require('../model/repositories/dict_types.custom');
const dictItemRepo = require('../model/repositories/dict_items.custom');
const staffRepo = require('../model/repositories/staff.custom');
const reward_dto = require('../model/dto/reward.dto');
const discipline_dto = require('../model/dto/discipline.dto');
const bodyParser = require("body-parser");

/**
 * Function search data staff positions
 * @param {Object} searchObj condition search
 * @returns Array data
 */
async function search(searchObj, isCount, getAll) {
    let datas = await rewardAndDisciplineRepo.findAll(searchObj, isCount, getAll);
    if(datas.length > 0) {
        for(let data of datas) {
            if(data.effective_date) {
                data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
            }
            if(data.expired_date) {
                data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
            }
        }
    }

    return datas;
}

/**
 * Service search all reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function findAll(req, res) {
    const searchObj = {
        name: req.body['name'],
        staff_code: req.body['staff_code'],
        type: req.body['type'],
        decision_no: req.body['decision_no'],
        start_date: req.body['start_date'],
        end_date: req.body['end_date'],
        page: req.body['page'],
        size: req.body['size']
    }

    let count = await rewardAndDisciplineRepo.findAll(searchObj,true, true);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await search(searchObj, false, false);

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));
}

/**
 * Service create reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function create(req, res) {
    let body = req.body;
    body.is_active = config.active.true;
    config.audit(body, req, false);
    const id = await db.getNextSequence(config.sequence.reward_and_discipline_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.reward_and_discipline + id;

    for(let key of Object.keys(body)) {
        if(body[key] == '') body[key] = null;
    }

    // create
    db.db.RewardAndDiscipline.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('reward_and_discipline.created.success'));
    }).catch(error => {
        config.logError(error);
        config.response(res, error, config.httpStatus.badRequest, req.__('reward_and_discipline.created.failed'));
    })
}

/**
 * Service update reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function update(req, res) {
    let body = req.body;
    const id = req.params['id'];

    if(!!id) {
        body.id = id;

        db.db.RewardAndDiscipline.findOne({
            where: {
                id: body.id
            },
            raw: true
        }).then(result => {
            if(!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.updated.not_found'));
                return;
            }

            // get data result
            for(let key of Object.keys(result)) {
                if(!!body[key] || body[key] == null || body[key] == '') {
                    if(body[key] == '') result[key] = null;
                    else result[key] = body[key];
                }
            }

            config.audit(result, req, true);
            db.db.RewardAndDiscipline.update(result, {
                where: {
                    id: body.id,
                }
            }).then(result => {
                config.response(res, result, config.httpStatus.success, req.__('reward_and_discipline.updated.success'));
            }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('reward_and_discipline.updated.failed'));
            })
        }).catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('reward_and_discipline.updated.find_record_failed'));
        })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.updated.find_record_failed'));
    }
}

/**
 * Service delete reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function deleteRewardAndDiscipline(req, res) {
    const id = req.params['id'];

    if(!!id) {
        db.db.RewardAndDiscipline.update({
            update_time: now(),
            update_by: req.user.email.email,
            is_active: config.active.false
        },{
            where: {
                id: id
            }
        }).then(result => {
            config.response(res, result, config.httpStatus.success, req.__('reward_and_discipline.delete.success'));
        }).catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('reward_and_discipline.delete.failed'));
        })
    } else {
        config.response(res, null, comfig.httpStatus.badRequest, req.__('reward_and_discipline.delete.find_record_failed'))
    }
}

/**
 * Get path template 
 * @param {Number} type 
 * @returns 
 */
function getTemplatePath(type) {
    switch(type) {
        case config.reward_and_discipline_template.reward_template: 
            return {
                path: '/templates/khen_thuong.xlsx',
                result: 'khen_thuong_result.xlsx'
            };
        case config.reward_and_discipline_template.discipline_template:
            return {
                path: '/templates/ky_luat.xlsx',
                result: 'ky_luat_result.xlsx'
            };
    }
}

/**
 * Process reference reward template
 * @param {*} req 
 * @param {*} res 
 * @param {*} wb 
 */
async function referRewardTemplate(wb) {
    let reward_type = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.LOAI_KHEN_THUONG, null);

    let list_reward_type = []
    if(!!reward_type && reward_type.length > 0) {
        list_reward_type = await dictItemRepo.findByDictTypeId(reward_type[0].id, null);
    }

    let sheet = wb.worksheets[1];

    config.writeRefer(sheet, list_reward_type, reward_dto.reward_refer.reward_type);
}

/**
 * Process reference discipline template
 * @param {*} req 
 * @param {*} res 
 * @param {*} wb 
 */
async function referDisciplineTemplate(wb) {
    let discipline_type = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.HINH_THUC_KY_LUAT, null);

    let list_discipline_type = []
    if(!!discipline_type && discipline_type.length > 0) {
        list_discipline_type = await dictItemRepo.findByDictTypeId(discipline_type[0].id, null);
    }

    let sheet = wb.worksheets[1];

    config.writeRefer(sheet, list_discipline_type, discipline_dto.discipline_refer.discipline_type);
}

/**
 * Service export template reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function exportTemplate(req, res) {
    const type = !!req.body ? req.body.type : undefined;
    if(!!type) {
        const wb = new Excel.Workbook();
        const path2 = getTemplatePath(type);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + path2.result
        );
        wb.xlsx.readFile(path.dirname(__dirname) + path2.path)
            .then(async () => {
                // add reference
                switch(type) {
                    case config.reward_and_discipline_template.reward_template:
                        await referRewardTemplate(wb);
                        break;
                    case config.reward_and_discipline_template.discipline_template:
                        await referDisciplineTemplate(wb);
                        break;
                }
                wb.xlsx.write(res);
            }).catch(error => {
                config.logError(error);
                config.response(res, error, config.httpStatus.badRequest, 'system.error')
            })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.export_template.type_not_found'));
    }
}

/**
 * Process export data reward
 * @param {*} req 
 * @param {*} res 
 * @param {*} wb 
 */
async function exportRewardData(searchObj, wb) {
    const sheet = wb.worksheets[0];
    const startIndex = reward_dto.start_index;

    let datas = []
    if(!!searchObj.list_category_id && searchObj.list_category_id) {
        datas = await rewardAndDisciplineRepo.findByListCategory(searchObj.list_category_id);
    } else {
        datas = await search(searchObj, false, true);
    }

    let index = 1
    for(let data of datas) {

        if(data.type !== config.reward_and_discipline_template.reward_template) {
            continue;
        }
        if(!!data.form_of_reward) {
            const form_of_reward_select = config.form_of_reward.find(x => x.index == data.form_of_reward);
            if(!!form_of_reward_select) {
                data.form_of_reward = form_of_reward_select.label;
            } else data.form_of_reward = null;
        }

        if(!!data.salary_status) {
            const salary_status_select = config.salary_status.find(x => x.index == data.salary_status);
            if(!!salary_status_select) {
                data.salary_status = salary_status_select.label;
            } else data.salary_status = null;
        }

        if(!!data.reward_type && !!data.reward_type_name) {
            data.reward_type = data.reward_type_name;
        } else data.reward_type = null;

        if(!!data.effective_date) {
            data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
        }

        let insert = [index];
        for(let c = 1; c < reward_dto.mapping.length; c++) {
            insert.push(data[reward_dto.mapping[c].field]);
        }

        sheet.insertRow(startIndex + index - 1, insert);
        index++;
    }
}

/**
 * Process export data discipline
 * @param {*} req 
 * @param {*} res 
 * @param {*} wb 
 */
async function exportDisciplineData(searchObj, wb) {
    const sheet = wb.worksheets[0];
    const startIndex = discipline_dto.start_index;

    let datas = []
    if(!!searchObj.list_category_id && searchObj.list_category_id) {
        datas = await rewardAndDisciplineRepo.findByListCategory(searchObj.list_category_id);
    } else {
        datas = await search(searchObj, false, true);
    }

    let index = 1
    for(let data of datas) {

        if(data.type !== config.reward_and_discipline_template.discipline_template) {
            continue;
        }

        if(!!data.salary_status) {
            const salary_status_select = config.salary_status.find(x => x.index == data.salary_status);
            if(!!salary_status_select) {
                data.salary_status = salary_status_select.label;
            } else data.salary_status = null;
        }

        if(!!data.discipline_type && !!data.discipline_type_name) {
            data.discipline_type = data.discipline_type_name;
        } else data.discipline_type = null;

        if(!!data.effective_date) {
            data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
        }

        if(!!data.expired) {
            data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
        }

        let insert = [index];
        for(let c = 1; c < discipline_dto.mapping.length; c++) {
            insert.push(data[discipline_dto.mapping[c].field]);
        }

        sheet.insertRow(startIndex + index - 1, insert);
        index++;
    }
}

/**
 * Service export data reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function exportExcel(req, res) {
    let body = req.body
    let type = body.type;
    if(!!type) {
        const wb = new Excel.Workbook();
        const path2 = getTemplatePath(type);
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + path2
        );

        const searchObj = {
            name: body['name'],
            staff_code: body['staff_code'],
            type: body['type'],
            dicision_no: body['dicision_no'],
            time_start: body['time_start'],
            time_end: body['time_end'],
            list_category_id: body['list_category_id'],
            excel: true
        }

        wb.xlsx.readFile(path.dirname(__dirname) + path2.path) 
        .then(async () => {
            // add data
            switch(type) {
                case config.reward_and_discipline_template.reward_template:
                    await exportRewardData(searchObj, wb);
                    break;
                case config.reward_and_discipline_template.discipline_template:
                    await exportDisciplineData(searchObj, wb);
                    break;
            }
            wb.xlsx.write(res);
        }).catch(error => {
            config.logError(error);
            config.response(res, error, config.httpStatus.badRequest, req.__('reward_and_discipline.export_data.failed'));
        })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.export_data.type_not_found'));
    }
}

/**
 * Process import data reward
 * @param {*} req 
 * @param {*} res 
 */
async function processImportReward(req, res) {
    config.importExcel(req, res, true, reward_dto, async(datas, flags, resultObj) => {
        let created = [];
        let updated = [];

        // get list dict item for reward_type
        const reward_type = await dictTypeRepo.findByDictTypeName(config.DICT_TYPE_NAME.LOAI_KHEN_THUONG, null);

        let list_reward_type = [];
        if(!!reward_type && reward_type.length > 0) {
            list_reward_type = await dictItemRepo.findByDictTypeId(reward_type[0].id, null);
        }

        for(let i = 0; i < datas.length; i++) {
            let data = datas[i];

            // staff_code
            if(!!data.staff_code) {
                let staff = await staffRepo.findByStaffId(data.staff_code);
                if(staff.length > 0) {
                    data.staff_id = staff[0].id;
                } else {
                    data.result = req.__('reward_and_discipline.import.staff_code.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('reward_and_discipline.import.staff_code.empty');
                resultObj.totalError++;
                continue;
            }

            // reward_type
            if(!!data.reward_type) {
                let reward_type_input = list_reward_type.find(x => x.dict_name.toLowerCase() === data.reward_type.toLowerCase());
                if(!reward_type_input) {
                    data.result = req.__('reward_and_discipline.import.reward_type.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.reward_type = reward_type_input.id;
                }
            } else {
                data.result = req.__('reward_and_discipline.import.reward_type.empty');
                resultObj.totalError++;
                continue;
            }

            // effective_date
            if(!!data.effective_date) {
                const effective_date = config.getDateImport(data.effective_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!effective_date) {
                    data.result = req.__('reward_and_discipline.import.effective_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.effective_date = effective_date;
            } else {
                data.result = req.__('reward_and_discipline.import.effective_date.empty');
                resultObj.totalError++;
                continue;
            }
            
            // decision_no
            if(!data.decision_no) {
                data.result = req.__('reward_and_discipline.import.decision_no.empty');
                resultObj.totalError++;
                continue;
            } else if(data.decision_no.length > 50) {
                data.result = req.__('reward_and_discipline.import.decision_no.too_long_50');
                resultObj.totalError++;
                continue;
            }

            // reason
            if(!data.reason) {
                data.result = req.__('reward_and_discipline.import.reason.empty');
                resultObj.totalError++;
                continue;
            } else if(data.reason.length > 500) {
                data.result = req.__('reward_and_discipline.import.reason.too_long_500');
                resultObj.totalError++;
                continue;
            }

            // form_of_reward
            if(!!data.form_of_reward) {
                const form_of_reward_input = config.form_of_reward.find(x => x.label.toLowerCase() === data.form_of_reward.toLowerCase())
                if(!form_of_reward_input) {
                    data.result = req.__('reward_and_discipline.import.form_of_reward.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.form_of_reward = form_of_reward_input.index;
                }
            } else {
                data.result = req.__('reward_and_discipline.import.form_of_reward.empty');
                resultObj.totalError++;
                continue;
            }

            // gif_in_kind
            if(data.form_of_reward == config.form_of_reward[1].index 
                || data.form_of_reward == config.form_of_reward[2].index) {
                if(!data.gif_in_kind) {
                    data.result = req.__('reward_and_discipline.import.gif_in_kind.empty');
                    resultObj.totalError++;
                    continue;
                } else if(data.gif_in_kind.length > 200) {
                    data.result = req.__('reward_and_discipline.import.gif_in_kind.too_long_200');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.gif_in_kind = null;
            }

            if(data.form_of_reward == config.form_of_reward[0].index 
                || data.form_of_reward == config.form_of_reward[2].index) {
                // amount_money 
                if(!!data.amount_money) {
                    const amount_money_input = Number(data.amount_money);
                    if(Number.isNaN(amount_money_input)) { 
                        data.result = req.__('reward_and_discipline.import.amount_money.invalid_format');
                        resultObj.totalError++;
                        continue;
                    } else {
                        data.amount_money = parseFloat(amount_money_input).toFixed(2);
                    }
                } else {
                    data.result = req.__('reward_and_discipline.import.amount_money.empty');
                    resultObj.totalError++;
                    continue;
                }

                // salary_status
                if(!!data.salary_status) {
                    let salary_status_input = config.salary_status.find(x => x.label.toLowerCase() === data.salary_status.toLowerCase())
                    if(!salary_status_input) {
                        data.result = req.__('reward_and_discipline.import.salary_status.not_found');
                        resultObj.totalError++;
                        continue;
                    } else {
                        data.salary_status = salary_status_input.index;
                    }
                } else {
                    data.result = req.__('reward_and_discipline.import.salary_status.empty');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.amount_money = null;
                data.salary_status = null;
            }

            // note
            if(data.form_of_reward == config.form_of_reward[3].index) {
                if(!data.note) {
                    data.result = req.__('reward_and_discipline.import.note.empty');
                    resultObj.totalError++;
                    continue;
                } else if(data.note.length > 500) {
                    data.result = req.__('reward_and_discipline.import.note.too_long_500');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.note = null;
            }

            for(let key of Object.keys(data)) {
                if(!data[key]) {
                    data[key] = null
                }
            }

            let entity = config.clone(data);
            entity.type = config.reward_and_discipline_template.reward_template;
            entity.is_active = config.active.true;
            if (data.system_code) {
                let existed = await rewardAndDisciplineRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;
                    config.audit(entity, req, true);
                    updated.push(entity);
                } else {
                    data.result = req.__('reward_and_discipline.import.find_by_system_code.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.reward_and_discipline_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.reward_and_discipline + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
        }

        if (created.length > 0) {
            try {
                await db.db.RewardAndDiscipline.bulkCreate(
                    created,
                    {
                        fields: reward_dto.fields,
                        updateOnDuplicate: reward_dto.update_key
                    }
                )
            } catch (error) {
                console.error(error);
                config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.import.create.failed'));
            }
        }

        if (updated.length > 0) {
            for (let entity of updated) {
                try {
                    await db.db.RewardAndDiscipline.upsert(entity);
                } catch (error) {
                    datas.every((data, index) => {
                        if(data.id == entity.id) {
                            datas[index].result = req.__('reward_and_discipline.import.update.failed');
                            resultObj.totalError++;
                            return false;
                        }
                        return true;
                    })
                    continue;
                }
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    })
}

/**
 * Process import data discipline
 * @param {*} req 
 * @param {*} res 
 */
async function processImportDiscipline(req, res) {
    config.importExcel(req, res, true, discipline_dto, async(datas, flags, resultObj) => {
        let created = [];
        let updated = [];

        // get list dict item for discipline_type
        const discipline_type = await dictTypeRepo.findByDictTypeName(config.DICT_TYPE_NAME.HINH_THUC_KY_LUAT, null);

        let list_discipline_type = [];
        if(!!discipline_type && discipline_type.length > 0) {
            list_discipline_type = await dictItemRepo.findByDictTypeId(discipline_type[0].id, null);
        }

        for(let i = 0; i < datas.length; i++) {
            let data = datas[i];

            // staff_code
            if(!!data.staff_code) {
                let staff = await staffRepo.findByStaffId(data.staff_code);
                if(staff.length > 0) {
                    data.staff_id = staff[0].id;
                } else {
                    data.result = req.__('reward_and_discipline.import.staff_code.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('reward_and_discipline.import.staff_code.empty');
                resultObj.totalError++;
                continue;
            }

            // discipline_type
            let discipline_type_is_kttn = false;
            if(!!data.discipline_type) {
                let discipline_type_input = list_discipline_type.find(x => x.dict_name.toLowerCase() === data.discipline_type.toLowerCase());
                if(!discipline_type_input) {
                    data.result = req.__('reward_and_discipline.import.discipline_type.not_found');
                    resultObj.totalError++;
                    continue;
                } else {    
                    data.discipline_type = discipline_type_input.id;
                    if(discipline_type_input.dict_name.toLowerCase() === config.DICT_ITEM_NAME.KHAU_TRU_THU_NHAP.toLowerCase()) {
                        discipline_type_is_kttn = true;
                    }
                }
            } else {
                data.result = req.__('reward_and_discipline.import.discipline_type.empty');
                resultObj.totalError++;
                continue;
            }

            // decision_no
            if(!data.decision_no) {
                data.result = req.__('reward_and_discipline.import.decision_no.empty');
                resultObj.totalError++;
                continue;
            } else if(data.decision_no.length > 50) {
                data.result = req.__('reward_and_discipline.import.decision_no.too_long_50');
                resultObj.totalError++;
                continue;
            }

            // effective_date
            if(!!data.effective_date) {
                const effective_date = config.getDateImport(data.effective_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!effective_date) {
                    data.result = req.__('reward_and_discipline.import.effective_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.effective_date = effective_date;
            } else {
                data.result = req.__('reward_and_discipline.import.effective_date.empty');
                resultObj.totalError++;
                continue;
            }

            // expired_date
            if(!!data.expired_date) {
                const expired_date = config.getDateImport(data.expired_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!expired_date) {
                    data.result = req.__('reward_and_discipline.import.expired_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.expired_date = expired_date;
                if(!moment(data.effective_date).isBefore(moment(data.expired_date))) {
                    data.result = req.__('reward_and_discipline.import.expired_date.less_than');
                    resultObj.totalError++;
                    continue;
                }
            }

            // reason
            if(!data.reason) {
                data.result = req.__('reward_and_discipline.import.reason.empty');
                resultObj.totalError++;
                continue;
            } else if(data.reason.length > 500) {
                data.result = req.__('reward_and_discipline.import.reason.too_long_500');
                resultObj.totalError++;
                continue;
            }

            if(discipline_type_is_kttn) {
                // amount_money 
                if(!!data.amount_money) {
                    const amount_money_input = Number(data.amount_money);
                    if(Number.isNaN(amount_money_input)) { 
                        data.result = req.__('reward_and_discipline.import.amount_money.invalid_format');
                        resultObj.totalError++;
                        continue;
                    } else {
                        data.amount_money = parseFloat(amount_money_input).toFixed(2);
                    }
                } else {
                    data.result = req.__('reward_and_discipline.import.amount_money.empty');
                    resultObj.totalError++;
                    continue;
                }

                // salary_status
                if(!!data.salary_status) {
                    let salary_status_input = config.salary_status.find(x => x.label.toLowerCase() === data.salary_status.toLowerCase())
                    if(!salary_status_input) {
                        data.result = req.__('reward_and_discipline.import.salary_status.not_found');
                        resultObj.totalError++;
                        continue;
                    } else {
                        data.salary_status = salary_status_input.index;
                    }
                } else {
                    data.result = req.__('reward_and_discipline.import.salary_status.empty');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.amount_money = null;
                data.salary_status = null;
            }

            for(let key of Object.keys(data)) {
                if(!data[key]) {
                    data[key] = null
                }
            }

            let entity = config.clone(data);
            entity.type = config.reward_and_discipline_template.discipline_template;
            entity.is_active = config.active.true;
            if (data.system_code) {
                let existed = await rewardAndDisciplineRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;
                    config.audit(entity, req, true);
                    updated.push(entity);
                } else {
                    data.result = req.__('reward_and_discipline.import.find_by_system_code.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.reward_and_discipline_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.reward_and_discipline + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
        }

        if (created.length > 0) {
            try {
                await db.db.RewardAndDiscipline.bulkCreate(
                    created,
                    {
                        fields: discipline_dto.fields,
                        updateOnDuplicate: discipline_dto.update_key
                    }
                )
            } catch (error) {
                console.error(error);
                config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.import.create.failed'));
            }
        }

        if (updated.length > 0) {
            for (let entity of updated) {
                try {
                    await db.db.RewardAndDiscipline.upsert(entity);
                } catch (error) {
                    datas.every((data, index) => {
                        if(data.id == entity.id) {
                            datas[index].result = req.__('reward_and_discipline.import.update.failed');
                            resultObj.totalError++;
                            return false;
                        }
                        return true;
                    })
                    continue;
                }
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    })
}

/**
 * Service import data reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function importExcel(req, res) {
    let type = !!req.body ? parseInt(req.body.type) : undefined;
    if(type === config.reward_and_discipline_template.reward_template ||
        type === config.reward_and_discipline_template.discipline_template) {
        switch(type) {
            case config.reward_and_discipline_template.reward_template:
                processImportReward(req, res);
                break;
            case config.reward_and_discipline_template.discipline_template:
                processImportDiscipline(req, res);
                break;
        }
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('reward_and_discipline.import.type_not_found'));
    }
}

module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteRewardAndDiscipline: deleteRewardAndDiscipline,
    exportTemplate: exportTemplate,
    exportExcel: exportExcel,
    importExcel: importExcel,
}
