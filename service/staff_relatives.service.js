
const db = require("../config/database-config");
let staffRelatives = require('../model/repositories/staff_relatives.custom');
let config = require('../config');
const {now} = require("moment");


function findAll(req, res) {
    const searchObj = {
        staff_id: req.query['staff_id'],
        page: req.query['page'],
        size: req.query['size']
    }

    staffRelatives.findStaffRelatives(searchObj)
        .then(result => {
            config.response(res, result, config.httpStatus.success, req.__('system.success'));
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });

}

async function create(req, res) {
    var body = req.body;
    body.is_active = config.active.true;

    let id = await db.getNextSequence(config.sequence.staff_relatives_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.relative + id;
    // if(body.effective_date) {
    //     if(!config.checkPattern(body.effective_date, config.pattern.effect_month)) {
    //         config.response(res, null, config.httpStatus.badRequest, req.__('contract.effective_date.invalid_format'));
    //         return;
    //     }
    // }
    //
    // if(body.expired_month) {
    //     if(!config.checkPattern(body.expired_month, config.pattern.effect_month)) {
    //         config.response(res, null, config.httpStatus.badRequest, req.__('contract.expired_month.invalid_format'));
    //         return;
    //     }
    // }
    // body.effective_month = //config.convertDateToString(body.effective_month, 'MM/YYYY');
    // body.expired_month = //config.convertDateToString(body.expired_month, 'MM/YYYY');
    config.audit(body, req, false);

    // TODO tìm nhân viên để tạo
    db.db.StaffRelatives.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('staff_relatives.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_relatives.created.failed'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StaffRelatives.findOne(
            {
                where: {
                    id: body.id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('staff_relatives.update.not_found'));
                return;
            }
            result.name = body.name;
            result.date_of_birth = body.date_of_birth;
            result.relation = body.relation;
            result.is_dependant = body.is_dependant;
            result.citizen_id_no = body.citizen_id_no ? body.citizen_id_no : null;
            result.gender = body.gender ? body.gender : null;
            result.birth_certificate_no = body.birth_certificate_no ? body.birth_certificate_no : null;
            result.birth_certificate_book_no = body.birth_certificate_book_no ? body.birth_certificate_book_no : null;
            result.place_of_residence = body.place_of_residence ? body.place_of_residence : null;
            result.place_of_residence_detail = body.place_of_residence_detail ? body.place_of_residence_detail : null;
            result.effective_month = body.effective_month ? body.effective_month : null;
            result.expired_month = body.expired_month ? body.expired_month : null;
            result.pti_tax_code = body.pti_tax_code ? body.pti_tax_code : null;
            config.audit(result, req, true);
            db.db.StaffRelatives.update(result,
                {
                    where: { id: body.id },
                })
            .then(updated => {
                config.response(res, result, config.httpStatus.success, req.__('staff_relatives.update.success'));
            }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_relatives.update.fail'));
            });
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff_relatives.update.fail'));
        });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_relatives.update.fail'));
    }
}

function deleteRelative(req, res) {
    let id = req.params['id'];


    db.db.StaffRelatives.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: id}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('staff_relatives.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('staff_relatives.delete.fail'));
    })


}

module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteRelative: deleteRelative,
}
