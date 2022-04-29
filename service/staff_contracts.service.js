const db = require("../config/database-config");
let staffContractsRepo = require('../model/repositories/staff_contracts.custom');
let config = require('../config');
const {now} = require("moment");
const Excel = require('exceljs');
const path = require('path');
const dictTypeRepo = require('../model/repositories/dict_types.custom');
const dictItemRepo = require('../model/repositories/dict_items.custom');
const staffContractDto = require('../model/dto/staff_contract.dto');
const staffRepo = require('../model/repositories/staff.custom');
const moment = require('moment');

async function findAll(req, res) {
    const searchObj = {
        name: req.body['name'],
        staff_code: req.body['staff_id'],
        start_date: req.body['start_date'],
        end_date: req.body['end_date'],
        staff_position_id: req.body['staff_position_id'], //chuc danh
        core_position_id: req.body['core_position_id'],   //vi tri cong viec
        core_department_id: req.body['core_department_id'], //don vi
        page: req.body['page'],
        size: req.body['size']
    }

    let contractType = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CONTRACT_TYPE, null);
    let contracts = [];
    if(contractType) {
        contracts = await dictItemRepo.findByDictTypeId(contractType[0].id, null);
    }

    let count = await staffContractsRepo.findAll(searchObj,true, true);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await staffContractsRepo.findAll(searchObj, false, false);
    if(datas.length > 0) {
        for(let data of datas) {
            if(data.contract_type) {
                let c = contracts.find(x => x.id == data.contract_type);
                if(c) {
                    data.contract_type = c.dict_name;
                }
            }

            if(data.effective_date) {
                data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2);
            }
            if(data.expired_date) {
                data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2);
            }
        }
    }

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));

}

async function create(req, res) {
    let body = req.body;
    body.is_active = config.active.true;
    config.audit(body, req, false);
    let id = await db.getNextSequence(config.sequence.staff_contracts_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.contract + id;

    // TODO tìm nhân viên để tạo
    db.db.StaffContracts.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('staff_contracts.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_contracts.created.failed'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StaffContracts.findOne(
            {
                where: {
                    id: body.id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('staff_contracts.update.not_found'));
                return;
            }
            result.contract_type = body.contract_type;
            result.contract_no = body.contract_no;
            result.signer = body.signer;
            result.effective_date = body.effective_date;
            result.expired_date = body.expired_date;
            config.audit(result, req, true);
            db.db.StaffContracts.update(result,
                {
                    where: { id: body.id },
                })
                .then(updated => {
                    config.response(res, result, config.httpStatus.success, req.__('staff_contracts.update.success'));
                }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_contracts.update.fail'));
            });
        })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_contracts.update.fail'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('staff_contracts.update.fail'));
    }
}

function deleteContract(req, res) {
    let id = req.params['id'];


    db.db.StaffContracts.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: id}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('staff_contracts.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('staff_contracts.delete.fail'));
    })


}

function exportTemplate(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/thong_tin_hop_dong.xlsx';
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=thongt_tin_hop_dong.xlsx'
    );

    wb.xlsx.readFile(path.dirname(__dirname) + path2)
    .then(async () => {
        let contractType = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CONTRACT_TYPE, null);
        let contracts = [];
        if(!!contractType && contractType.length > 0) {
            contracts = await dictItemRepo.findByDictTypeId(contractType[0].id, null);
        }

        let sheet = wb.worksheets[1];

        config.writeRefer(sheet, contracts, staffContractDto.contract_refer.contract_type);

        wb.xlsx.write(res);
    });
}

async function searchContracts(req) {
    const searchObj = {
        name: req.body['name'],
        staff_code: req.body['staff_code'],
        start_date: req.body['start_date'],
        end_date: req.body['end_date'],
        staff_position_id: req.body['staff_position_id'], //chuc danh
        core_position_id: req.body['core_position_id'],   //vi tri cong viec
        core_department_id: req.body['core_department_id'], //don vi
        page: req.body['page'],
        size: req.body['size'],
        excel: true
    }

    return await staffContractsRepo.findAll(searchObj, false, false);
}

async function exportExcel(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = '/templates/thong_tin_hop_dong.xlsx';
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=thong_tin_hop_dong.xlsx'
    );

    wb.xlsx.readFile(path.dirname(__dirname) + path2)
    .then(async () => {
        let categoryId = req.body.list_category_id;
        if(categoryId.length === 0) {
            const allStaff = await searchContracts(req);
            categoryId = allStaff.map(x => x.id);
        }
        let datas = await staffContractsRepo.findAllByListCategoryId(categoryId);

        let contractType = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CONTRACT_TYPE, null);
        let contracts = [];
        if(contractType) {
            contracts = await dictItemRepo.findByDictTypeId(contractType[0].id, null);
        }

        let sheet = wb.worksheets[0];

        let index = 1;
        for(let data of datas) {
            if(data.contract_type) {
                let c = contracts.find(x => x.id == data.contract_type);
                if(c) {
                    data.contract_type_str = c.dict_name;
                }
            }

            if(data.effective_date) {
                data.effective_date = moment(data.effective_date).format(config.date_format.dd_mm_yyyy2)
            }
            if(data.expired_date) {
                data.expired_date = moment(data.expired_date).format(config.date_format.dd_mm_yyyy2)
            }

            let insert = [index];
            for(let c = 1; c < staffContractDto.mapping.length; c++) {
                insert.push(data[staffContractDto.mapping[c].field]);
            }
            sheet.insertRow(staffContractDto.start_index + index-1, insert);
            index++;

        }

        wb.xlsx.write(res);
    });
}

async function importExcel(req, res) {
    config.importExcel(req, res, true, staffContractDto,async (datas, flags, resultObj) => {
        
        let contractType = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CONTRACT_TYPE, null);
        let contracts = [];
        if(contractType) {
            contracts = await dictItemRepo.findByDictTypeId(contractType[0].id, null);
        }
        let created = [];
        let updated = [];
        for(let i = 0; i < datas.length; i++) {
            let data = datas[i];
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

            if(data.contract_type_str) {
                let c = contracts.find(x => x.dict_name.toLowerCase() === data.contract_type_str.toLowerCase());
                if(c) {
                    data.contract_type = c.id;
                } else {
                    data.result = req.__('contract.contract_type_str.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('contract.contract_type_str.empty');
                resultObj.totalError++;
                continue;
            }

            if(!data.contract_no) {
                data.result = req.__('contract.contract_no.empty');
                resultObj.totalError++;
                continue;
            }

            if(data.effective_date) {
                const effective_date = config.getDateImport(data.effective_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!effective_date) {
                    data.result = req.__('contract.effective_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.effective_date = effective_date;
            } else {
                data.result = req.__('contract.effective_date.empty');
                resultObj.totalError++;
                continue;
            }

            if(data.expired_date) {
                const expired_date = config.getDateImport(data.expired_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!expired_date) {
                    data.result = req.__('contract.expired_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.expired_date = expired_date;
                
                if(!moment(data.effective_date).isBefore(moment(data.expired_date))){
                    data.result = req.__('contract.checkDate.invalid_input_date');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('contract.expired_date.empty');
                resultObj.totalError++;
                continue;
            }

            if(!data.signer) {
                data.result = req.__('contract.signer.empty');
                resultObj.totalError++;
                continue;
            }

            let entity = config.clone(data);
            if(data.system_code) {
                let existed = await staffContractsRepo.findBySystemCode(data.system_code);
                if(existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.staff_id = existed[0].staff_id;
                    entity.created_by = existed[0].created_by;
                    entity.created_time = existed[0].created_time;

                    /** update by flags **/
                    config.updateFlags(existed[0], entity, flags, staffContractDto);
                    config.audit(existed[0], req, true);
                    updated.push(existed[0]);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {

                let id = await db.getNextSequence(config.sequence.staff_contracts_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.contract + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;
        }

        if(created.length > 0) {
            await db.db.StaffContracts.bulkCreate(
                created,
                {
                    fields: staffContractDto.fields,
                    updateOnDuplicate: staffContractDto.update_key
                }
            )
        }
        if(updated.length > 0) {
            for (const entity of updated) {
                await db.db.StaffContracts.upsert(entity);
            }
        }

        datas.forEach(data => {
            if(!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}

async function generateContractNo(req, res) {
    let id = await db.getNextSequence(config.sequence.staff_contracts_no_seq);
    let contractNo = String(id).padStart(9, '0');
    config.response(res, `1${contractNo}`, config.httpStatus.success);

}

module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteContract: deleteContract,
    exportTemplate: exportTemplate,
    exportExcel: exportExcel,
    importExcel: importExcel,
    generateContractNo: generateContractNo
}
