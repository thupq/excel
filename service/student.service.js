const db = require("../config/database-config");
const Student = db.db.Student;
let config = require('../config');
let studentRepo = require('../model/repositories/student.custom');
const Excel = require('exceljs');
const path = require('path');
const {now} = require("moment");
const student_import_dto = require('../model/dto/student_import.dto')

async function create(req, res) {
    try {
        const body = req.body;

        const student_id = await studentRepo.findByStudentId(body.student_id);
        if (student_id.length > 0) {
            config.response(res, null, config.httpStatus.badRequest, req.__('staff.exist'));
        }

        const code = await studentRepo.selectNextStudentId();
        body.id = code[0].nextval;

        let student = {
            ...body,
            created_by: req.user.email.email,
            created_time: now(),
            updated_by: req.user.email.email,
            updated_time: now(),
        };
        db.db.Student.create(student).then(result => {
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
        let student = await Student.findByPk(body.id);
        if (!student) {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff.notexist'));
        }

        student = {
            ...student,
            ...body,
            updated_time: now(),
            updated_by: req.user.email.email,
        };
        Student.update(student, {where: {id: student.id}}).then(result => {
            config.response(res, result, config.httpStatus.success, req.__('staff.update.success'));
        }).catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('staff.update.failed'));
        });
    } catch (e) {
        config.logError(e, req);
    }
}

function deleteStudent(req, res) {
    let id = req.params['id'];
    if (id) {
        db.db.Student.findOne(
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
            db.db.Student.update(result,
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

function findOne(req, res) {
    let id = req.params['id'];
    if (id) {
        db.db.Student.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            })
            .then(async result => {
                config.response(res, result, config.httpStatus.success, req.__('system.success'));
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('staff.notexist'));
    }

}

/**
 * Function search data staff positions
 * @param {Object} searchObj condition search
 * @returns Array data
 */
 async function search(searchObj, isCount, getAll) {
    let datas = await studentRepo.findAll(searchObj, isCount, getAll);
    return datas;
}

/**
 * Service search all reward and discipline
 * @param {*} req 
 * @param {*} res 
 */
async function findAll(req, res) {
    const searchObj = {
        student_id: req.body['student_id'],
        name: req.body['name'],
        class_name: req.body['class_name'],
        gender: req.body['gender'],
        address: req.body['address'],
        mobile_phone: req.body['mobile_phone'],
        page: req.body['page'],
        size: req.body['size']
    }

    let count = await studentRepo.findAll(searchObj,true, true);
    res.setHeader(
        'X-Total-Count',
        count[0].count
    );

    let datas = await search(searchObj, false, false);

    config.response(res, datas, config.httpStatus.success, req.__('system.success'));
}

// function getTemplatePath(type) {
//     switch (type) {
//         case config.staff_template.personal_info:
//             return {
//                 path: '/templates/thong_tin_ca_nhan.xlsx',
//                 result: 'thong_tin_ca_nhan_result.xlsx'
//             };
//         case config.staff_template.certificate:
//             return {
//                 path: '/templates/bang_cap_chung_chi.xlsx',
//                 result: 'bang_cap_chung_chi_result.xlsx'
//             };
//         case config.staff_template.experience:
//             return {
//                 path: '/templates/kinh_nghiem_lam_viec.xlsx',
//                 result: 'kinh_nghiem_lam_viec_result.xlsx'
//             };
//         case config.staff_template.relative:
//             return {
//                 path: '/templates/danh_sach_nhan_than.xlsx',
//                 result: 'danh_sach_nhan_than_result.xlsx'
//             };
//     }
// }

// async function exportData(req, res) {

//     const body = req.body;
//     const wb = new Excel.Workbook();
//     const path2 = getTemplatePath(body.type);
//     res.setHeader(
//         'Content-Type',
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//         'Content-Disposition',
//         'attachment; filename=' + path2.result
//     );

//     wb.xlsx.readFile(path.dirname(__dirname) + path2.path)
//         .then(async () => {

//             /** add reference **/
//             switch (body.type) {
//                 case config.staff_template.personal_info:
//                     await exportStaff(req, res, wb);
//                     break;
//                 case config.staff_template.certificate:
//                     await exportCertificate(req, res, wb);
//                     break;
//                 case config.staff_template.experience:
//                     await exportExperience(req, res, wb);
//                     break;
//                 case config.staff_template.relative:
//                     await exportRelative(req, res, wb);
//                     break;
//             }
//             wb.xlsx.write(res);
//         })
//         .catch(error => {
//             console.error(error);
//             config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
//         });

// }

async function importTemplate(req, res) {
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        'attachment; filename=noi_dung_danh_muc.xlsx'
    );
    const body = req.body;
    switch (Number(body.type)) {
        case 1:
            return importStudentTemplate(req, res);
    }
}

function importStudentTemplate(req, res) {
    config.importExcel(req, res, true, student_import_dto, async (datas, flags, resultObj) => {

        let created = [];
        let updated = [];
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            let entity = config.clone(data);
           
            let ids = await studentRepo.selectNextStudentId();
            entity.id = ids[0].nextval;
            config.audit(entity, req, false);
            created.push(entity);
            
            entity.is_active = config.active.true;


        }

        if (created.length > 0) {
            await db.db.Student.bulkCreate(
                created,
                {
                    fields: student_import_dto.fields,
                    updateOnDuplicate: student_import_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.Student.upsert(entity);
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}

async function exportTemplate(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = getTemplatePath(body.type);
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

            /** add reference **/
            switch (body.type) {
                case 1:
                    await referStudentTemplate(req, res, wb);
                    break;
            }
            wb.xlsx.write(res);
        })
        .catch(error => {
            console.error(error);
            config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
        });

}

async function referStudentTemplate(req, res, wb) {
//     let carer = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGANH, null);
//     let specialized = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUYEN_NGANH, null);
//     let classification = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.XEP_LOAI_BANG_CAP, null);

//     let carers = [];
//     let specializeds = [];
//     let classifications = [];
//     if (!!carer && carer.length > 0) {
//         carers = await dictItemRepo.findByDictTypeId(carer[0].id, null);
//     }
//     if (!!specialized && carer.length > 0) {
//         specializeds = await dictItemRepo.findByDictTypeId(specialized[0].id, null);
//     }
//     if (!!classification && classification.length > 0) {
//       classifications = await dictItemRepo.findByDictTypeId(classification[0].id, null);
//   }
//     let sheet = wb.worksheets[1];

//     config.writeRefer(sheet, carers, staff_certificate_dto.cer_refer.carer);
//     config.writeRefer(sheet, specializeds, staff_certificate_dto.cer_refer.specialized);
//     config.writeRefer(sheet, classifications, staff_certificate_dto.cer_refer.classification);
}

module.exports = {
    create: create,
    update: update,
    deleteStudent: deleteStudent,
    findOne: findOne,
    findAll: findAll,
    importTemplate: importTemplate,
    exportTemplate: exportTemplate,
    // exportData: exportData
}